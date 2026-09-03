// 用户与会话的 JSON 文件存储（零依赖，适用于无数据库环境）
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

export type UserLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';
export type UserAgeGroup = 'child' | 'teen' | 'adult' | 'senior';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  level: UserLevel;
  ageGroup: UserAgeGroup;
  goals: string[];
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
  phone?: string; // 可选绑定手机号，用于忘记邮箱时找回
  passwordHash?: string; // 登录密码哈希（scrypt: salt:hash），旧账号可能没有
  createdAt: number;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  level: UserLevel;
  ageGroup: UserAgeGroup;
  goals: string[];
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
  phone?: string;
  createdAt: number;
}

interface SessionRecord {
  token: string;
  userId: string;
  createdAt: number;
}

function ensureDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch (err) {
    console.error('[STORE] read failed:', file, err);
    return fallback;
  }
}

function writeJson(file: string, data: unknown): void {
  ensureDir();
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function loadUsers(): UserRecord[] {
  return readJson<UserRecord[]>(USERS_FILE, []);
}

function saveUsers(users: UserRecord[]): void {
  writeJson(USERS_FILE, users);
}

function loadSessions(): SessionRecord[] {
  return readJson<SessionRecord[]>(SESSIONS_FILE, []);
}

function saveSessions(sessions: SessionRecord[]): void {
  writeJson(SESSIONS_FILE, sessions);
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

// ===== 密码哈希（scrypt + 随机盐） =====
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(candidate, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return loadUsers().find((u) => u.email === email);
}

export function findUserById(id: string): UserRecord | undefined {
  return loadUsers().find((u) => u.id === id);
}

export function createUser(data: { email: string; name?: string; password?: string }): UserRecord {
  const users = loadUsers();
  const now = Date.now();
  const user: UserRecord = {
    id: crypto.randomUUID(),
    email: data.email,
    name: data.name?.trim() || data.email.split('@')[0] || 'Learner',
    avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
    level: 'intermediate',
    ageGroup: 'adult',
    goals: ['daily_conversation'],
    totalSessions: 0,
    totalMinutes: 0,
    averageScore: 0,
    passwordHash: data.password ? hashPassword(data.password) : undefined,
    createdAt: now,
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function updateUser(
  id: string,
  patch: Partial<Pick<UserRecord, 'name' | 'level' | 'ageGroup' | 'goals' | 'totalSessions' | 'totalMinutes' | 'averageScore' | 'phone'>>,
): UserRecord | undefined {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return undefined;
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  return users[idx];
}

/** 删除用户及其全部会话，返回是否删除成功 */
/** 重置用户登录密码（忘记密码场景） */
export function updateUserPassword(id: string, newPassword: string): UserRecord | undefined {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return undefined;
  users[idx] = { ...users[idx], passwordHash: hashPassword(newPassword) };
  saveUsers(users);
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = loadUsers();
  const next = users.filter((u) => u.id !== id);
  if (next.length === users.length) return false;
  saveUsers(next);
  // 同时清理该用户的所有会话 token
  saveSessions(loadSessions().filter((s) => s.userId !== id));
  return true;
}

export function createSession(userId: string): string {
  const sessions = loadSessions();
  const token = crypto.randomBytes(32).toString('hex');
  sessions.push({ token, userId, createdAt: Date.now() });
  // 简单清理过期会话（30 天）
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  saveSessions(sessions.filter((s) => s.createdAt > cutoff));
  return token;
}

export function findSession(token: string): SessionRecord | undefined {
  return loadSessions().find((s) => s.token === token);
}

export function deleteSession(token: string): void {
  saveSessions(loadSessions().filter((s) => s.token !== token));
}

export function toPublicUser(u: UserRecord): PublicUser {
  const { id, email, name, avatarColor, level, ageGroup, goals, totalSessions, totalMinutes, averageScore, phone, createdAt } = u;
  return { id, email, name, avatarColor, level, ageGroup, goals, totalSessions, totalMinutes, averageScore, phone, createdAt };
}

export function findUserByPhone(phone: string): UserRecord | undefined {
  return loadUsers().find((u) => u.phone === phone);
}

// 供路由鉴权中间件使用
export function resolveUserFromToken(token: string | undefined): UserRecord | undefined {
  if (!token) return undefined;
  const session = findSession(token);
  if (!session) return undefined;
  return findUserById(session.userId);
}
