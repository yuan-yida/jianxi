// 邮箱验证码注册 / 登录
import { Router, type Request, Response, NextFunction } from 'express';
import {
  findUserByEmail,
  findUserById,
  findUserByPhone,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  createSession,
  findSession,
  deleteSession,
  resolveUserFromToken,
  toPublicUser,
  verifyPassword,
} from '../lib/store';
import { cleanupUserCommunityData } from '../lib/communityStore';
import { sendVerificationEmail } from '../lib/mailer';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RE = /^\d{6}$/;
const PASSWORD_MIN = 6; // 密码最短长度
const CODE_TTL_MS = 10 * 60 * 1000; // 验证码有效期 10 分钟
const RESEND_INTERVAL_MS = 60 * 1000; // 同一邮箱 60 秒内不可重发
const MAX_ATTEMPTS = 5; // 验证码最多尝试次数

interface CodeEntry {
  code: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}

// 验证码存内存，重启服务后失效
const codeStore = new Map<string, CodeEntry>();

function cleanExpired(): void {
  const now = Date.now();
  for (const [email, entry] of codeStore) {
    if (entry.expiresAt < now) codeStore.delete(email);
  }
}

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function verifyCode(email: string, code: string): 'ok' | 'expired' | 'mismatch' | 'too_many' {
  const entry = codeStore.get(email);
  if (!entry) return 'expired';
  if (entry.expiresAt < Date.now()) {
    codeStore.delete(email);
    return 'expired';
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    codeStore.delete(email);
    return 'too_many';
  }
  if (entry.code !== code) {
    entry.attempts += 1;
    return 'mismatch';
  }
  codeStore.delete(email);
  return 'ok';
}

export function authRequired(req: Request, res: Response, next: NextFunction): void {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const user = resolveUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }
  (req as Request & { userId?: string }).userId = user.id;
  next();
}

function requireBody(res: Response, body: Record<string, unknown>, fields: string[]): boolean {
  for (const field of fields) {
    if (!body[field] || String(body[field]).trim() === '') {
      res.status(400).json({ error: `MISSING_${field.toUpperCase()}` });
      return false;
    }
  }
  return true;
}

/**
 * POST /api/auth/send-code
 * 发送邮箱验证码
 */
router.post('/api/auth/send-code', async (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  if (!requireBody(res, body, ['email'])) return;

  const email = String(body.email).trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'INVALID_EMAIL' });
    return;
  }

  cleanExpired();
  const existing = codeStore.get(email);
  if (existing && Date.now() - existing.lastSentAt < RESEND_INTERVAL_MS) {
    const retryAfter = Math.ceil((RESEND_INTERVAL_MS - (Date.now() - existing.lastSentAt)) / 1000);
    res.status(429).json({ error: 'TOO_FREQUENT', retryAfter });
    return;
  }

  const code = randomCode();
  codeStore.set(email, { code, expiresAt: Date.now() + CODE_TTL_MS, lastSentAt: Date.now(), attempts: 0 });

  const result = await sendVerificationEmail(email, code);
  if (!result.delivered && !result.dev) {
    res.status(502).json({ error: 'MAIL_SEND_FAILED', detail: result.error });
    return;
  }

  res.json({ ok: true, devCode: result.dev ? result.devCode : undefined });
});

/**
 * POST /api/auth/register
 * 邮箱 + 验证码注册，需设置登录密码（可附带昵称）
 */
router.post('/api/auth/register', (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  if (!requireBody(res, body, ['email', 'code', 'password'])) return;

  const email = String(body.email).trim().toLowerCase();
  const code = String(body.code).trim();
  const password = String(body.password || '');
  const name = String(body.name || '').trim().slice(0, 20);

  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'INVALID_EMAIL' });
    return;
  }
  if (!CODE_RE.test(code)) {
    res.status(400).json({ error: 'INVALID_CODE' });
    return;
  }
  if (password.length < PASSWORD_MIN) {
    res.status(400).json({ error: 'WEAK_PASSWORD' });
    return;
  }
  if (findUserByEmail(email)) {
    res.status(409).json({ error: 'EMAIL_EXISTS' });
    return;
  }
  const check = verifyCode(email, code);
  if (check === 'mismatch') {
    res.status(400).json({ error: 'CODE_WRONG' });
    return;
  }
  if (check !== 'ok') {
    res.status(400).json({ error: 'CODE_EXPIRED' });
    return;
  }

  const user = createUser({ email, name, password });
  const token = createSession(user.id);
  res.json({ token, user: toPublicUser(user) });
});

/**
 * POST /api/auth/login
 * 邮箱 + 密码登录（不再支持验证码登录）
 */
router.post('/api/auth/login', (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  if (!requireBody(res, body, ['email', 'password'])) return;

  const email = String(body.email).trim().toLowerCase();
  const password = String(body.password || '');

  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'INVALID_EMAIL' });
    return;
  }

  const user = findUserByEmail(email);
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    // 统一响应，不暴露邮箱是否已注册
    res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    return;
  }

  const token = createSession(user.id);
  res.json({ token, user: toPublicUser(user) });
});

/**
 * GET /api/auth/me
 * 当前登录用户
 */
router.get('/api/auth/me', authRequired, (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId;
  const user = userId ? findUserById(userId) : undefined;
  if (!user) {
    res.status(404).json({ error: 'USER_NOT_FOUND' });
    return;
  }
  res.json({ user: toPublicUser(user) });
});

/**
 * PUT /api/auth/me
 * 更新当前用户资料（昵称 / 学习画像）
 */
router.put('/api/auth/me', authRequired, (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId;
  const body = (req.body || {}) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  if (typeof body.name === 'string') {
    const name = body.name.trim().slice(0, 20);
    if (name) patch.name = name;
  }
  if (typeof body.level === 'string') patch.level = body.level;
  if (typeof body.ageGroup === 'string') patch.ageGroup = body.ageGroup;
  if (Array.isArray(body.goals)) patch.goals = body.goals.slice(0, 10);
  if (typeof body.totalSessions === 'number') patch.totalSessions = body.totalSessions;
  if (typeof body.totalMinutes === 'number') patch.totalMinutes = body.totalMinutes;
  if (typeof body.averageScore === 'number') patch.averageScore = body.averageScore;
  if (typeof body.phone === 'string') {
    const phone = body.phone.trim();
    if (!phone) {
      patch.phone = undefined; // 解绑手机号
    } else if (/^\d{6,15}$/.test(phone)) {
      const owner = findUserByPhone(phone);
      if (owner && owner.id !== userId) {
        res.status(409).json({ error: 'PHONE_EXISTS' });
        return;
      }
      patch.phone = phone;
    } else {
      res.status(400).json({ error: 'INVALID_PHONE' });
      return;
    }
  }

  const user = userId ? updateUser(userId, patch) : undefined;
  if (!user) {
    res.status(404).json({ error: 'USER_NOT_FOUND' });
    return;
  }
  res.json({ user: toPublicUser(user) });
});

/**
 * POST /api/auth/logout
 * 退出登录（使会话 token 失效）
 */
router.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (findSession(token)) deleteSession(token);
  res.json({ ok: true });
});

/**
 * POST /api/auth/delete-account
 * 注销账户（永久删除用户及所有关联数据）。
 * 若设置了密码，需提交密码确认；未设置密码的旧账号可直接注销。
 */
router.post('/api/auth/delete-account', authRequired, (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId;
  const user = userId ? findUserById(userId) : undefined;
  if (!user) {
    res.status(404).json({ error: 'USER_NOT_FOUND' });
    return;
  }

  const body = (req.body || {}) as Record<string, unknown>;
  const password = String(body.password || '');
  if (user.passwordHash) {
    if (!password) {
      res.status(400).json({ error: 'PASSWORD_REQUIRED' });
      return;
    }
    if (!verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }
  }

  // 清理社区个人数据（点赞/收藏/关注），再删除账号及全部会话
  cleanupUserCommunityData(user.id);
  deleteUser(user.id);
  res.json({ ok: true });
});

/**
 * POST /api/auth/send-reset-code
 * 发送密码重置验证码。邮箱未注册时同样返回成功，避免泄露注册状态。
 */
router.post('/api/auth/send-reset-code', async (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  if (!requireBody(res, body, ['email'])) return;

  const email = String(body.email).trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'INVALID_EMAIL' });
    return;
  }

  cleanExpired();
  const existing = codeStore.get(email);
  if (existing && Date.now() - existing.lastSentAt < RESEND_INTERVAL_MS) {
    const retryAfter = Math.ceil((RESEND_INTERVAL_MS - (Date.now() - existing.lastSentAt)) / 1000);
    res.status(429).json({ error: 'TOO_FREQUENT', retryAfter });
    return;
  }

  const code = randomCode();
  codeStore.set(email, { code, expiresAt: Date.now() + CODE_TTL_MS, lastSentAt: Date.now(), attempts: 0 });

  const result = await sendVerificationEmail(email, code);
  if (!result.delivered && !result.dev) {
    res.status(502).json({ error: 'MAIL_SEND_FAILED', detail: result.error });
    return;
  }

  res.json({ ok: true, devCode: result.dev ? result.devCode : undefined });
});

/**
 * POST /api/auth/reset-password
 * 忘记密码：邮箱 + 验证码 + 新密码，重置登录密码
 */
router.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  if (!requireBody(res, body, ['email', 'code', 'password'])) return;

  const email = String(body.email).trim().toLowerCase();
  const code = String(body.code).trim();
  const password = String(body.password || '');

  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'INVALID_EMAIL' });
    return;
  }
  if (!CODE_RE.test(code)) {
    res.status(400).json({ error: 'INVALID_CODE' });
    return;
  }
  if (password.length < PASSWORD_MIN) {
    res.status(400).json({ error: 'WEAK_PASSWORD' });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'USER_NOT_FOUND' });
    return;
  }

  const check = verifyCode(email, code);
  if (check === 'mismatch') {
    res.status(400).json({ error: 'CODE_WRONG' });
    return;
  }
  if (check !== 'ok') {
    res.status(400).json({ error: 'CODE_EXPIRED' });
    return;
  }

  updateUserPassword(user.id, password);
  res.json({ ok: true });
});

/**
 * POST /api/auth/recover
 * 忘记邮箱：通过绑定的手机号找回（返回脱敏邮箱）
 */
router.post('/api/auth/recover', (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  const phone = String(body.phone || '').trim();
  if (!/^\d{6,15}$/.test(phone)) {
    res.status(400).json({ error: 'INVALID_PHONE' });
    return;
  }
  const user = findUserByPhone(phone);
  if (!user) {
    // 统一响应，避免暴露手机号是否已注册
    res.json({ found: false });
    return;
  }
  const [local, domain] = user.email.split('@');
  const masked = local.length <= 2 ? `${local[0]}***` : `${local.slice(0, 2)}***`;
  res.json({ found: true, maskedEmail: `${masked}@${domain}` });
});

export default router;
