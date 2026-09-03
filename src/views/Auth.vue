<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@/i18n';
import { useUserStore } from '@/stores/user';
import { authApi, ApiError } from '@/api/auth';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const userStore = useUserStore();

type Mode = 'login' | 'register';

const mode = ref<Mode>(route.query.mode === 'register' ? 'register' : 'login');
const email = ref('');
const password = ref('');
const code = ref('');
const name = ref('');
const countdown = ref(0);
const sending = ref(false);
const submitting = ref(false);
const error = ref('');
const info = ref('');
const editingName = ref(false);
const nameDraft = ref('');
// 忘记邮箱找回
const showRecover = ref(false);
const recoverPhone = ref('');
const recovering = ref(false);
const recoverHint = ref('');
const recoverResult = ref('');
// 忘记密码重置
const showReset = ref(false);
const resetEmail = ref('');
const resetCode = ref('');
const resetNewPassword = ref('');
const resetSending = ref(false);
const resetSubmitting = ref(false);
const resetHint = ref('');
const resetInfo = ref('');
const resetCountdown = ref(0);
let resetTimer: number | undefined;
// 手机号绑定
const phoneDraft = ref('');
const phoneSaving = ref(false);
const phoneHint = ref('');

const currentPhone = computed(() => userStore.authUser?.phone || '');

const isLogin = computed(() => mode.value === 'login');

const sendButtonLabel = computed(() => {
  if (countdown.value > 0) return `${t('auth.resendIn')}(${countdown.value}s)`;
  return sending.value ? t('auth.sending') : t('auth.sendCode');
});

let timer: number | undefined;

onUnmounted(() => {
  if (timer) window.clearInterval(timer);
  if (resetTimer) window.clearInterval(resetTimer);
});

function startCountdown() {
  countdown.value = 60;
  if (timer) window.clearInterval(timer);
  timer = window.setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0 && timer) {
      window.clearInterval(timer);
      timer = undefined;
    }
  }, 1000);
}

function translateError(e: unknown): string {
  if (e instanceof ApiError) {
    const map: Record<string, string> = {
      TOO_FREQUENT: t('auth.errTooFrequent'),
      CODE_WRONG: t('auth.errCodeWrong'),
      CODE_EXPIRED: t('auth.errCodeExpired'),
      EMAIL_EXISTS: t('auth.errEmailExists'),
      INVALID_CODE: t('auth.errInvalidCode'),
      INVALID_EMAIL: t('auth.errInvalidEmail'),
      MAIL_SEND_FAILED: t('auth.errMailFailed'),
      UNAUTHORIZED: t('auth.errUnauthorized'),
      INVALID_PHONE: t('auth.invalidPhone'),
      PHONE_EXISTS: t('auth.errPhoneExists'),
      INVALID_CREDENTIALS: t('auth.errInvalidCredentials'),
      WEAK_PASSWORD: t('auth.errWeakPassword'),
      USER_NOT_FOUND: t('auth.errUserNotFound'),
    };
    return map[e.message] || e.message;
  }
  return t('auth.errGeneric');
}

async function handleSendCode() {
  if (countdown.value > 0 || sending.value) return;
  const value = email.value.trim();
  if (!value) {
    error.value = t('auth.emailRequired');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error.value = t('auth.invalidEmail');
    return;
  }
  sending.value = true;
  error.value = '';
  info.value = '';
  try {
    const res = await authApi.sendCode(value);
    if (res.devCode) {
      code.value = res.devCode;
      info.value = t('auth.devCodeHint');
    } else {
      info.value = t('auth.emailSent');
    }
    startCountdown();
  } catch (e) {
    error.value = translateError(e);
  } finally {
    sending.value = false;
  }
}

async function handleSubmit() {
  if (submitting.value) return;
  const emailValue = email.value.trim();
  const passwordValue = password.value;
  const codeValue = code.value.trim();
  if (!emailValue) {
    error.value = t('auth.emailRequired');
    return;
  }
  if (!passwordValue) {
    error.value = t('auth.passwordRequired');
    return;
  }
  if (passwordValue.length < 6) {
    error.value = t('auth.errWeakPassword');
    return;
  }
  if (!isLogin.value) {
    if (!codeValue) {
      error.value = t('auth.codeRequired');
      return;
    }
    if (!name.value.trim()) {
      error.value = t('auth.nameRequired');
      return;
    }
  }
  submitting.value = true;
  error.value = '';
  try {
    if (isLogin.value) {
      await userStore.login(emailValue, passwordValue);
    } else {
      await userStore.register(emailValue, codeValue, passwordValue, name.value.trim());
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    router.push(redirect);
  } catch (e) {
    error.value = translateError(e);
  } finally {
    submitting.value = false;
  }
}

function startEditName() {
  nameDraft.value = userStore.authUser?.name || '';
  editingName.value = true;
}

async function saveName() {
  const value = nameDraft.value.trim();
  if (!value) return;
  try {
    await userStore.updateName(value);
    editingName.value = false;
    error.value = '';
  } catch (e) {
    error.value = translateError(e);
  }
}

async function handleLogout() {
  await userStore.logout();
  router.push('/');
}

function openRecover() {
  recoverPhone.value = '';
  recoverHint.value = '';
  recoverResult.value = '';
  showRecover.value = true;
}

function openReset() {
  resetEmail.value = '';
  resetCode.value = '';
  resetNewPassword.value = '';
  resetHint.value = '';
  resetInfo.value = '';
  resetCountdown.value = 0;
  showReset.value = true;
}

function startResetCountdown() {
  resetCountdown.value = 60;
  if (resetTimer) window.clearInterval(resetTimer);
  resetTimer = window.setInterval(() => {
    resetCountdown.value -= 1;
    if (resetCountdown.value <= 0 && resetTimer) {
      window.clearInterval(resetTimer);
      resetTimer = undefined;
    }
  }, 1000);
}

async function handleSendResetCode() {
  if (resetCountdown.value > 0 || resetSending.value) return;
  const value = resetEmail.value.trim();
  if (!value) {
    resetHint.value = t('auth.emailRequired');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    resetHint.value = t('auth.invalidEmail');
    return;
  }
  resetSending.value = true;
  resetHint.value = '';
  resetInfo.value = '';
  try {
    const res = await authApi.sendResetCode(value);
    if (res.devCode) {
      resetCode.value = res.devCode;
      resetInfo.value = t('auth.devCodeHint');
    } else {
      resetInfo.value = t('auth.resetEmailSent');
    }
    startResetCountdown();
  } catch (e) {
    resetHint.value = translateError(e);
  } finally {
    resetSending.value = false;
  }
}

async function handleResetSubmit() {
  if (resetSubmitting.value) return;
  const emailValue = resetEmail.value.trim();
  const codeValue = resetCode.value.trim();
  const passwordValue = resetNewPassword.value;
  if (!emailValue) {
    resetHint.value = t('auth.emailRequired');
    return;
  }
  if (!codeValue) {
    resetHint.value = t('auth.codeRequired');
    return;
  }
  if (passwordValue.length < 6) {
    resetHint.value = t('auth.errWeakPassword');
    return;
  }
  resetSubmitting.value = true;
  resetHint.value = '';
  resetInfo.value = '';
  try {
    await authApi.resetPassword({ email: emailValue, code: codeValue, password: passwordValue });
    showReset.value = false;
    // 重置成功：自动用新密码登录
    try {
      await userStore.login(emailValue, passwordValue);
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
      router.push(redirect);
    } catch {
      // 自动登录失败时把凭据填入登录表单，提示用户手动登录
      mode.value = 'login';
      email.value = emailValue;
      password.value = passwordValue;
      code.value = '';
      info.value = t('auth.resetSuccess');
    }
  } catch (e) {
    resetHint.value = translateError(e);
  } finally {
    resetSubmitting.value = false;
  }
}

async function handleRecover() {
  if (recovering.value) return;
  const phone = recoverPhone.value.trim();
  if (!/^\d{6,15}$/.test(phone)) {
    recoverHint.value = t('auth.invalidPhone');
    return;
  }
  recovering.value = true;
  recoverHint.value = '';
  recoverResult.value = '';
  try {
    const res = await authApi.recover(phone);
    if (res.found && res.maskedEmail) {
      recoverResult.value = `${t('auth.recoverFound')} ${res.maskedEmail}`;
    } else {
      recoverResult.value = t('auth.recoverNotFound');
    }
  } catch (e) {
    recoverHint.value = translateError(e);
  } finally {
    recovering.value = false;
  }
}

async function savePhone() {
  if (phoneSaving.value) return;
  const phone = phoneDraft.value.trim();
  if (phone && !/^\d{6,15}$/.test(phone)) {
    phoneHint.value = t('auth.invalidPhone');
    return;
  }
  phoneSaving.value = true;
  phoneHint.value = '';
  try {
    await userStore.updatePhone(phone);
    phoneDraft.value = '';
    phoneHint.value = phone ? t('auth.phoneBound') : t('auth.phoneUnbound');
  } catch (e) {
    phoneHint.value = translateError(e);
  } finally {
    phoneSaving.value = false;
  }
}
</script>

<template>
  <div>
  <div class="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg shadow-indigo-200">V</div>
        <h1 class="text-xl font-bold text-slate-800 mt-3">VerbFlow</h1>
        <p class="text-sm text-slate-400 mt-0.5">{{ userStore.isLoggedIn ? t('auth.accountTitle') : t('auth.subtitle') }}</p>
      </div>

      <div class="card p-6 sm:p-8">
        <!-- 已登录：个人中心 -->
        <template v-if="userStore.isLoggedIn && userStore.authUser">
          <div class="flex flex-col items-center text-center">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
              :style="{ background: userStore.authUser.avatarColor }"
            >
              {{ userStore.authUser.name.charAt(0).toUpperCase() }}
            </div>
            <div class="mt-3 flex items-center gap-2">
              <span class="text-lg font-bold text-slate-800">{{ userStore.authUser.name }}</span>
              <button
                class="text-xs px-2 py-1 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                @click="startEditName"
              >
                ✏️ {{ t('auth.editName') }}
              </button>
            </div>
            <div class="text-sm text-slate-400 mt-0.5">{{ userStore.authUser.email }}</div>
            <div class="text-[11px] mt-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
              {{ userStore.levelLabel }}
            </div>

            <!-- 昵称编辑 -->
            <div v-if="editingName" class="w-full mt-4">
              <div class="flex gap-2">
                <input
                  v-model="nameDraft"
                  type="text"
                  maxlength="20"
                  class="flex-1 text-sm bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  @keyup.enter="saveName"
                />
                <button class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-xl" @click="saveName">✓</button>
              </div>
            </div>

            <!-- 学习统计 -->
            <div class="w-full grid grid-cols-3 gap-3 mt-6">
              <div class="bg-slate-50 rounded-xl p-3">
                <div class="text-lg font-bold text-slate-800">{{ userStore.authUser.totalSessions }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">{{ t('auth.statSessions') }}</div>
              </div>
              <div class="bg-slate-50 rounded-xl p-3">
                <div class="text-lg font-bold text-slate-800">{{ userStore.authUser.totalMinutes }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">{{ t('auth.statMinutes') }}</div>
              </div>
              <div class="bg-slate-50 rounded-xl p-3">
                <div class="text-lg font-bold text-slate-800">{{ Math.round(userStore.authUser.averageScore) }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">{{ t('auth.statAvg') }}</div>
              </div>
            </div>

            <!-- 绑定手机号（用于忘记邮箱时找回） -->
            <div class="w-full mt-5 bg-slate-50 rounded-xl p-4 text-left">
              <div class="text-xs font-medium text-slate-500 mb-2">
                📱 {{ t('auth.phoneBindTitle') }}
                <span v-if="currentPhone" class="text-emerald-600 ml-1">{{ currentPhone }}</span>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="phoneDraft"
                  type="tel"
                  inputmode="numeric"
                  maxlength="15"
                  :placeholder="t('auth.phonePlaceholder')"
                  class="flex-1 text-sm bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  class="shrink-0 px-4 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
                  :class="currentPhone ? 'text-rose-500 bg-rose-50 hover:bg-rose-100' : 'text-white bg-indigo-600 hover:bg-indigo-700'"
                  :disabled="phoneSaving"
                  @click="savePhone"
                >
                  {{ currentPhone ? t('auth.phoneUnbind') : t('auth.phoneBind') }}
                </button>
              </div>
              <p v-if="phoneHint" class="text-[11px] mt-1.5 text-emerald-600">{{ phoneHint }}</p>
            </div>

            <button
              class="mt-6 w-full py-2.5 text-sm font-medium text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              @click="handleLogout"
            >
              {{ t('auth.logout') }}
            </button>
          </div>
        </template>

        <!-- 未登录：登录 / 注册表单 -->
        <template v-else>
          <div class="flex items-center bg-slate-50 rounded-xl p-1 mb-6">
            <button
              class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="isLogin ? 'text-indigo-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              @click="mode = 'login'"
            >
              {{ t('auth.login') }}
            </button>
            <button
              class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="!isLogin ? 'text-indigo-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              @click="mode = 'register'"
            >
              {{ t('auth.register') }}
            </button>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- 邮箱 -->
            <div>
              <label class="text-xs font-medium text-slate-500">{{ t('auth.email') }}</label>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                :placeholder="t('auth.emailPlaceholder')"
                class="mt-1 w-full text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <!-- 密码 -->
            <div>
              <label class="text-xs font-medium text-slate-500">{{ t('auth.password') }}</label>
              <input
                v-model="password"
                type="password"
                :autocomplete="isLogin ? 'current-password' : 'new-password'"
                maxlength="64"
                :placeholder="t('auth.passwordPlaceholder')"
                class="mt-1 w-full text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <!-- 验证码（注册） -->
            <div v-if="!isLogin">
              <label class="text-xs font-medium text-slate-500">{{ t('auth.code') }}</label>
              <div class="mt-1 flex gap-2">
                <input
                  v-model="code"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  :placeholder="t('auth.codePlaceholder')"
                  class="flex-1 text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 tracking-widest"
                />
                <button
                  type="button"
                  class="shrink-0 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors disabled:opacity-60"
                  :class="countdown > 0 ? 'bg-slate-100 text-slate-400' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'"
                  :disabled="countdown > 0 || sending"
                  @click="handleSendCode"
                >
                  {{ sendButtonLabel }}
                </button>
              </div>
            </div>

            <!-- 昵称（注册） -->
            <div v-if="!isLogin">
              <label class="text-xs font-medium text-slate-500">{{ t('auth.nickname') }}</label>
              <input
                v-model="name"
                type="text"
                maxlength="20"
                :placeholder="t('auth.nicknamePlaceholder')"
                class="mt-1 w-full text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <!-- 提示 -->
            <p v-if="info" class="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{{ info }}</p>
            <p v-if="error" class="text-xs text-rose-500 bg-rose-50 rounded-lg px-3 py-2">{{ error }}</p>

            <button
              type="submit"
              class="w-full py-3 text-sm font-bold text-white btn-primary rounded-xl disabled:opacity-60"
              :disabled="submitting"
            >
              {{ submitting ? t('auth.submitting') : isLogin ? t('auth.loginSubmit') : t('auth.registerSubmit') }}
            </button>

            <!-- 忘记邮箱 / 忘记密码 -->
            <div class="text-center mt-3 flex items-center justify-center gap-5">
              <button
                type="button"
                class="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                @click="openRecover"
              >
                {{ t('auth.forgotEmail') }}
              </button>
              <button
                type="button"
                class="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                @click="openReset"
              >
                {{ t('auth.forgotPassword') }}
              </button>
            </div>
          </form>
        </template>
      </div>
    </div>
  </div>

  <!-- 忘记邮箱弹层 -->
  <Teleport to="body">
    <div
      v-if="showRecover"
      class="fixed inset-0 z-50 flex items-center justify-center px-4"
      @click.self="showRecover = false"
    >
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      <div class="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-800">🔍 {{ t('auth.recoverTitle') }}</h3>
          <button class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors" @click="showRecover = false">
            ✕
          </button>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed mb-4">{{ t('auth.recoverDesc') }}</p>
        <input
          v-model="recoverPhone"
          type="tel"
          inputmode="numeric"
          maxlength="15"
          :placeholder="t('auth.phonePlaceholder')"
          class="w-full text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <p v-if="recoverHint" class="text-xs text-rose-500 bg-rose-50 rounded-lg px-3 py-2 mt-3">{{ recoverHint }}</p>
        <p v-if="recoverResult" class="text-xs bg-emerald-50 text-emerald-600 rounded-lg px-3 py-2 mt-3 leading-relaxed">{{ recoverResult }}</p>
        <button
          class="mt-4 w-full py-2.5 text-sm font-bold text-white btn-primary rounded-xl disabled:opacity-60"
          :disabled="recovering"
          @click="handleRecover"
        >
          {{ recovering ? t('auth.recovering') : t('auth.recoverSubmit') }}
        </button>
      </div>
    </div>
  </Teleport>

  <!-- 忘记密码弹层 -->
  <Teleport to="body">
    <div
      v-if="showReset"
      class="fixed inset-0 z-50 flex items-center justify-center px-4"
      @click.self="showReset = false"
    >
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      <div class="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-800">🔑 {{ t('auth.resetTitle') }}</h3>
          <button class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors" @click="showReset = false">
            ✕
          </button>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed mb-4">{{ t('auth.resetDesc') }}</p>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-slate-500">{{ t('auth.email') }}</label>
            <input
              v-model="resetEmail"
              type="email"
              autocomplete="email"
              :placeholder="t('auth.emailPlaceholder')"
              class="mt-1 w-full text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500">{{ t('auth.code') }}</label>
            <div class="mt-1 flex gap-2">
              <input
                v-model="resetCode"
                type="text"
                inputmode="numeric"
                maxlength="6"
                :placeholder="t('auth.codePlaceholder')"
                class="flex-1 text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 tracking-widest"
              />
              <button
                type="button"
                class="shrink-0 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors disabled:opacity-60"
                :class="resetCountdown > 0 ? 'bg-slate-100 text-slate-400' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'"
                :disabled="resetCountdown > 0 || resetSending"
                @click="handleSendResetCode"
              >
                {{ resetCountdown > 0 ? `${t('auth.resendIn')}(${resetCountdown}s)` : resetSending ? t('auth.sending') : t('auth.sendCode') }}
              </button>
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500">{{ t('auth.newPassword') }}</label>
            <input
              v-model="resetNewPassword"
              type="password"
              autocomplete="new-password"
              maxlength="64"
              :placeholder="t('auth.passwordPlaceholder')"
              class="mt-1 w-full text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              @keyup.enter="handleResetSubmit"
            />
          </div>
        </div>
        <p v-if="resetInfo" class="text-xs bg-emerald-50 text-emerald-600 rounded-lg px-3 py-2 mt-3 leading-relaxed">{{ resetInfo }}</p>
        <p v-if="resetHint" class="text-xs text-rose-500 bg-rose-50 rounded-lg px-3 py-2 mt-3">{{ resetHint }}</p>
        <button
          class="mt-4 w-full py-2.5 text-sm font-bold text-white btn-primary rounded-xl disabled:opacity-60"
          :disabled="resetSubmitting"
          @click="handleResetSubmit"
        >
          {{ resetSubmitting ? t('auth.resetting') : t('auth.resetSubmit') }}
        </button>
      </div>
    </div>
  </Teleport>
  </div>
</template>
