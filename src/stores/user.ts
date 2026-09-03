import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { router } from '@/router';
import { authApi, type AuthUser } from '@/api/auth';

export interface UserProfile {
  name: string;
  level: 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';
  ageGroup: 'child' | 'teen' | 'adult' | 'senior';
  goals: string[];
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
}

const TOKEN_KEY = 'verbflow_auth_token';

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile>({
    name: 'Learner',
    level: 'intermediate',
    ageGroup: 'adult',
    goals: ['daily_conversation', 'travel'],
    totalSessions: 0,
    totalMinutes: 0,
    averageScore: 0,
  });

  const hasTakenTest = ref(false);

  // ===== 登录引导：未登录时跳转登录页，返回 false =====
  function requireLogin(): boolean {
    if (isLoggedIn.value) return true;
    const current = router.currentRoute.value.fullPath;
    router.push({ path: '/auth', query: { redirect: current } });
    return false;
  }

  // ===== 邮箱账号登录态 =====
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const authUser = ref<AuthUser | null>(null);
  const authLoading = ref(false);

  const isLoggedIn = computed(() => Boolean(token.value && authUser.value));
  const displayName = computed(() => authUser.value?.name || profile.value.name || 'Learner');

  const levelLabel = computed(() => {
    const labels: Record<string, string> = {
      beginner: 'Beginner (A1)',
      elementary: 'Elementary (A2)',
      intermediate: 'Intermediate (B1)',
      upper_intermediate: 'Upper Intermediate (B2)',
      advanced: 'Advanced (C1)',
    };
    return labels[profile.value.level] || 'Intermediate (B1)';
  });

  function updateProfile(data: Partial<UserProfile>) {
    profile.value = { ...profile.value, ...data };
    // 已登录用户同步学习画像到服务端
    if (token.value && authUser.value) {
      const { name, level, ageGroup, goals, totalSessions, totalMinutes, averageScore } = profile.value;
      authApi
        .updateMe(token.value, { name, level, ageGroup, goals, totalSessions, totalMinutes, averageScore })
        .then(({ user }) => {
          authUser.value = user;
        })
        .catch(() => undefined);
    }
  }

  /** 兼容别名：设置学习画像字段（如入学测试结果） */
  function setProfile(data: Partial<UserProfile>) {
    updateProfile(data);
  }

  /** 标记已完成入学水平测试 */
  function markTestDone() {
    hasTakenTest.value = true;
  }

  function addSession(minutes: number, score: number) {
    profile.value.totalSessions += 1;
    profile.value.totalMinutes += minutes;
    const total = profile.value.totalSessions;
    profile.value.averageScore =
      (profile.value.averageScore * (total - 1) + score) / total;
    if (token.value && authUser.value) {
      const { name, level, ageGroup, goals, totalSessions, totalMinutes, averageScore } = profile.value;
      authApi
        .updateMe(token.value, { name, level, ageGroup, goals, totalSessions, totalMinutes, averageScore })
        .then(({ user }) => {
          authUser.value = user;
        })
        .catch(() => undefined);
    }
  }

  // 启动时恢复会话
  async function initAuth() {
    if (!token.value) return;
    authLoading.value = true;
    try {
      const { user } = await authApi.me(token.value);
      authUser.value = user;
      // 用服务端资料初始化本地画像（学习统计数据以服务端为准，新账户从零开始）
      profile.value = {
        ...profile.value,
        name: user.name,
        level: user.level,
        ageGroup: user.ageGroup,
        goals: user.goals,
        totalSessions: user.totalSessions,
        totalMinutes: user.totalMinutes,
        averageScore: user.averageScore,
      };
    } catch {
      token.value = null;
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      authLoading.value = false;
    }
  }

  function setSession(newToken: string, user: AuthUser) {
    token.value = newToken;
    authUser.value = user;
    localStorage.setItem(TOKEN_KEY, newToken);
    profile.value = {
      ...profile.value,
      name: user.name,
      level: user.level,
      ageGroup: user.ageGroup,
      goals: user.goals,
      totalSessions: user.totalSessions,
      totalMinutes: user.totalMinutes,
      averageScore: user.averageScore,
    };
  }

  async function login(email: string, password: string): Promise<AuthUser> {
    const { token: newToken, user } = await authApi.login({ email, password });
    setSession(newToken, user);
    return user;
  }

  async function register(email: string, code: string, password: string, name: string): Promise<AuthUser> {
    const { token: newToken, user } = await authApi.register({ email, code, password, name });
    setSession(newToken, user);
    return user;
  }

  async function updateName(name: string): Promise<void> {
    if (!token.value) return;
    const { user } = await authApi.updateMe(token.value, { name });
    authUser.value = user;
    profile.value = { ...profile.value, name: user.name };
  }

  async function updatePhone(phone: string): Promise<void> {
    if (!token.value) return;
    const { user } = await authApi.updateMe(token.value, { phone });
    authUser.value = user;
  }

  async function logout() {
    if (token.value) {
      try {
        await authApi.logout(token.value);
      } catch {
        // 忽略退出时的网络错误
      }
    }
    token.value = null;
    authUser.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  /** 注销账户：需密码确认（未设置密码的旧账号可传空串），成功后清除本地登录态 */
  async function deleteAccount(password: string): Promise<void> {
    if (!token.value) return;
    await authApi.deleteAccount(token.value, password);
    token.value = null;
    authUser.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  return {
    profile,
    hasTakenTest,
    token,
    authUser,
    authLoading,
    isLoggedIn,
    displayName,
    levelLabel,
    requireLogin,
    updateProfile,
    setProfile,
    markTestDone,
    addSession,
    initAuth,
    login,
    register,
    updateName,
    updatePhone,
    logout,
    deleteAccount,
  };
});
