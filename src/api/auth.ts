// 前端 auth API 封装
export type UserLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';
export type UserAgeGroup = 'child' | 'teen' | 'adult' | 'senior';

export interface AuthUser {
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

export interface RecoverResult {
  found: boolean;
  maskedEmail?: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export interface SendCodeResult {
  ok: boolean;
  devCode?: string;
}

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(message: string, status: number, data: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(String(data.error || 'REQUEST_FAILED'), res.status, data);
  }
  return data as T;
}

export const authApi = {
  sendCode(email: string): Promise<SendCodeResult> {
    return request<SendCodeResult>('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  register(payload: { email: string; code: string; password: string; name?: string }): Promise<AuthResult> {
    return request<AuthResult>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload: { email: string; password: string }): Promise<AuthResult> {
    return request<AuthResult>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  me(token: string): Promise<{ user: AuthUser }> {
    return request<{ user: AuthUser }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateMe(token: string, patch: Partial<Pick<AuthUser, 'name' | 'level' | 'ageGroup' | 'goals' | 'totalSessions' | 'totalMinutes' | 'averageScore' | 'phone'>>): Promise<{ user: AuthUser }> {
    return request<{ user: AuthUser }>('/api/auth/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    });
  },

  sendResetCode(email: string): Promise<SendCodeResult> {
    return request<SendCodeResult>('/api/auth/send-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(payload: { email: string; code: string; password: string }): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  recover(phone: string): Promise<RecoverResult> {
    return request<RecoverResult>('/api/auth/recover', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  logout(token: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  deleteAccount(token: string, password: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/api/auth/delete-account', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
  },
};
