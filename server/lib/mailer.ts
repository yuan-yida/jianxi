// 零依赖邮件发送模块
// - 配置 SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM 后走真实 SMTP 发送
//   （SMTP_PORT=465 走 TLS 直连，其余端口自动 STARTTLS 升级）
// - 未配置 SMTP 时进入开发模式：验证码打印到服务端日志，并在响应中回传 devCode，方便本地联调
import net from 'node:net';
import tls from 'node:tls';

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface MailResult {
  dev: boolean;
  devCode?: string;
  delivered: boolean;
  error?: string;
}

function loadConfig(): SmtpConfig | null {
  const host = (process.env.SMTP_HOST || '').trim();
  if (!host) return null;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const port = parseInt(process.env.SMTP_PORT || '465', 10) || 465;
  const from = (process.env.SMTP_FROM || user || '').trim();
  return { host, port, user, pass, from };
}

interface Pending {
  resolve: (data: string) => void;
  reject: (err: Error) => void;
}

class SmtpClient {
  private sock: net.Socket | null = null;
  private buffer = '';
  private pending: Pending | null = null;
  private timer: NodeJS.Timeout | null = null;

  private attach(sock: net.Socket): void {
    this.sock = sock;
    sock.on('data', (chunk) => {
      this.buffer += chunk.toString('utf8');
      if (!this.pending) return;
      const p = this.pending;
      this.pending = null;
      p.resolve(this.buffer.trimEnd());
      this.buffer = '';
    });
    sock.on('error', (err) => {
      if (this.pending) {
        const p = this.pending;
        this.pending = null;
        p.reject(err);
      }
    });
  }

  private connect(cfg: SmtpConfig, secure: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const sock = secure
        ? tls.connect({ host: cfg.host, port: cfg.port, rejectUnauthorized: false })
        : net.connect(cfg.port, cfg.host);
      sock.once('connect', () => {
        this.attach(sock);
        resolve();
      });
      sock.once('error', reject);
    });
  }

  private read(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
      this.kickTimeout();
    });
  }

  private kickTimeout(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const p = this.pending;
      if (p) {
        this.pending = null;
        p.reject(new Error('SMTP timeout'));
      }
      this.close();
    }, 20000);
  }

  private command(line: string): Promise<string> {
    if (!this.sock) return Promise.reject(new Error('SMTP not connected'));
    this.sock.write(line + '\r\n');
    return this.read();
  }

  private async startTls(cfg: SmtpConfig): Promise<void> {
    if (!this.sock) throw new Error('SMTP not connected');
    const plain = this.sock;
    await new Promise<void>((resolve, reject) => {
      const tlsSock = tls.connect({ socket: plain, rejectUnauthorized: false, servername: cfg.host });
      tlsSock.once('secureConnect', () => {
        this.attach(tlsSock);
        resolve();
      });
      tlsSock.once('error', reject);
    });
  }

  close(): void {
    if (this.timer) clearTimeout(this.timer);
    this.sock?.destroy();
    this.sock = null;
  }

  // 发送一封邮件，返回是否成功
  async send(cfg: SmtpConfig, to: string, subject: string, text: string): Promise<void> {
    try {
      await this.connect(cfg, cfg.port === 465);
      let reply = await this.read();
      if (!reply.startsWith('220')) throw new Error(`SMTP greeting failed: ${reply}`);

      reply = await this.command(`EHLO ${cfg.host}`);
      if (!reply.startsWith('250')) throw new Error(`EHLO failed: ${reply}`);

      if (cfg.port !== 465) {
        reply = await this.command('STARTTLS');
        if (reply.startsWith('220')) {
          await this.startTls(cfg);
          reply = await this.command(`EHLO ${cfg.host}`);
          if (!reply.startsWith('250')) throw new Error(`EHLO(STARTTLS) failed: ${reply}`);
        }
      }

      if (cfg.user) {
        const auth = Buffer.from(`\0${cfg.user}\0${cfg.pass}`).toString('base64');
        reply = await this.command(`AUTH PLAIN ${auth}`);
        if (!reply.startsWith('235')) throw new Error(`AUTH failed: ${reply}`);
      }

      reply = await this.command(`MAIL FROM:<${cfg.from}>`);
      if (!reply.startsWith('250')) throw new Error(`MAIL FROM failed: ${reply}`);

      reply = await this.command(`RCPT TO:<${to}>`);
      if (!reply.startsWith('250')) throw new Error(`RCPT TO failed: ${reply}`);

      reply = await this.command('DATA');
      if (!reply.startsWith('354')) throw new Error(`DATA failed: ${reply}`);

      const body = [
        `From: ${cfg.from}`,
        `To: ${to}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
        'Content-Type: text/plain; charset=UTF-8',
        'MIME-Version: 1.0',
        '',
        text,
        '.',
      ].join('\r\n');
      reply = await this.command(body);
      if (!reply.startsWith('250')) throw new Error(`Message rejected: ${reply}`);

      await this.command('QUIT').catch(() => undefined);
    } finally {
      this.close();
    }
  }
}

/**
 * 发送邮箱验证码
 * @param to 收件邮箱
 * @param code 6 位验证码
 */
export async function sendVerificationEmail(to: string, code: string): Promise<MailResult> {
  const subject = '【VerbFlow】邮箱验证码';
  const text = [
    `您好，`,
    ``,
    `您正在进行 VerbFlow 账号操作，邮箱验证码为：${code}`,
    ``,
    `验证码 10 分钟内有效，请勿泄露给他人。如果不是您本人操作，请忽略此邮件。`,
    ``,
    `—— VerbFlow 英语口语训练系统`,
  ].join('\n');

  const cfg = loadConfig();
  if (!cfg) {
    // 开发模式：无 SMTP 配置，打印验证码便于本地测试
    console.log('\n[DEV-MAIL] ============================================');
    console.log(`[DEV-MAIL] To: ${to}`);
    console.log(`[DEV-MAIL] Subject: ${subject}`);
    console.log(`[DEV-MAIL] Code: ${code}`);
    console.log('[DEV-MAIL] ============================================\n');
    return { dev: true, devCode: code, delivered: false };
  }

  try {
    const client = new SmtpClient();
    await client.send(cfg, to, subject, text);
    return { dev: false, delivered: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[MAIL] SMTP send failed:', message);
    return { dev: false, delivered: false, error: message };
  }
}
