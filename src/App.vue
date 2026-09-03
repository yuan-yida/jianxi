<template>
  <div class="min-h-screen">
    <nav class="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/')">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">V</div>
            <span class="text-lg font-bold text-slate-800">VerbFlow</span>
          </div>

          <div class="hidden md:flex items-center gap-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="isActive(item.path) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'"
            >
              {{ t(item.label) }}
            </router-link>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="toggleLocale"
              class="px-3 py-1.5 text-sm font-medium rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              {{ locale === 'zh' ? 'EN' : '中文' }}
            </button>
            <!-- 已登录：头像下拉菜单 -->
            <div v-if="user.isLoggedIn" class="relative user-menu">
              <button
                class="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
                :title="user.authUser?.email || ''"
                @click="menuOpen = !menuOpen"
              >
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  :style="{ background: user.authUser?.avatarColor || '#818cf8' }"
                >
                  {{ user.displayName.charAt(0).toUpperCase() }}
                </span>
                <svg class="w-3.5 h-3.5 text-slate-400 transition-transform" :class="{ 'rotate-180': menuOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              <!-- 下拉菜单 -->
              <transition name="dropdown">
                <div
                  v-if="menuOpen"
                  class="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl ring-1 ring-slate-100 border border-slate-100 overflow-hidden z-50"
                >
                  <div class="px-4 py-3 border-b border-slate-50">
                    <div class="text-sm font-bold text-slate-800 truncate">{{ user.displayName }}</div>
                    <div class="text-xs text-slate-400 truncate">{{ user.authUser?.email }}</div>
                  </div>
                  <div class="py-1">
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      @click="goAccount"
                    >
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {{ t('accountMenu.account') }}
                    </button>
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      @click="handleLogout"
                    >
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {{ t('accountMenu.logout') }}
                    </button>
                    <div class="border-t border-slate-50 my-1"></div>
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                      @click="openDeleteAccount"
                    >
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      {{ t('accountMenu.deleteAccount') }}
                    </button>
                  </div>
                </div>
              </transition>
            </div>
            <button
              v-else
              class="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              @click="router.push('/auth')"
            >
              {{ t('auth.login') }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 预览模式提示条：未注册可预览全部功能，不可使用 -->
    <div v-if="!user.isLoggedIn && !user.authLoading" class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-center gap-2 text-xs sm:text-sm">
        <svg class="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>{{ t('preview.banner') }}</span>
        <button
          @click="router.push({ path: '/auth', query: { mode: 'register' } })"
          class="font-semibold underline underline-offset-2 hover:text-indigo-200 transition-colors"
        >
          {{ t('preview.register') }}
        </button>
      </div>
    </div>

    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- 注销账户确认弹窗 -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-[60] flex items-center justify-center px-4"
        @click.self="closeDeleteModal"
      >
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-slate-800">
              <svg class="w-5 h-5 text-rose-500 inline -mt-0.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {{ t('accountMenu.deleteTitle') }}
            </h3>
            <button class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors" @click="closeDeleteModal">
              ✕
            </button>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed mb-4">{{ t('accountMenu.deleteDesc') }}</p>
          <input
            v-model="deletePassword"
            type="password"
            :placeholder="t('accountMenu.passwordPlaceholder')"
            autocomplete="current-password"
            maxlength="64"
            class="w-full text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-200"
            @keyup.enter="confirmDeleteAccount"
          />
          <p v-if="deleteError" class="text-xs text-rose-500 bg-rose-50 rounded-lg px-3 py-2 mt-3">{{ deleteError }}</p>
          <div class="flex gap-3 mt-5">
            <button
              class="flex-1 py-2.5 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              @click="closeDeleteModal"
            >
              {{ t('accountMenu.cancel') }}
            </button>
            <button
              class="flex-1 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-60"
              :disabled="deleting"
              @click="confirmDeleteAccount"
            >
              {{ deleting ? t('accountMenu.deleting') : t('accountMenu.confirmDelete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import { useI18n } from './i18n'
import { useLocaleStore } from './stores/locale'
import { ApiError } from './api/auth'

const router = useRouter()
const route = useRoute()
const user = useUserStore()
const { t, locale } = useI18n()
const localeStore = useLocaleStore()

// ===== 头像下拉菜单 =====
const menuOpen = ref(false)
// 注销账户
const showDeleteModal = ref(false)
const deletePassword = ref('')
const deleteError = ref('')
const deleting = ref(false)

function goAccount() {
  menuOpen.value = false
  router.push('/auth')
}

async function handleLogout() {
  menuOpen.value = false
  await user.logout()
  router.push('/')
}

function openDeleteAccount() {
  menuOpen.value = false
  deletePassword.value = ''
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return
  showDeleteModal.value = false
  deletePassword.value = ''
  deleteError.value = ''
}

async function confirmDeleteAccount() {
  if (deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await user.deleteAccount(deletePassword.value)
    showDeleteModal.value = false
    deletePassword.value = ''
    router.push('/')
  } catch (e) {
    if (e instanceof ApiError) {
      const map: Record<string, string> = {
        PASSWORD_REQUIRED: t('accountMenu.passwordRequired'),
        INVALID_CREDENTIALS: t('accountMenu.errInvalidCredentials'),
        UNAUTHORIZED: t('auth.errUnauthorized'),
        USER_NOT_FOUND: t('accountMenu.errNotFound'),
      }
      deleteError.value = map[e.message] || e.message
    } else {
      deleteError.value = t('auth.errGeneric')
    }
  } finally {
    deleting.value = false
  }
}

// 点击页面其他区域关闭菜单
function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (menuOpen.value && !target.closest('.user-menu')) {
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

const navItems = [
  { path: '/', label: 'nav.home' },
  { path: '/scenes', label: 'nav.scenes' },
  { path: '/chat', label: 'nav.chat' },
  { path: '/history', label: 'nav.history' },
  { path: '/community', label: 'nav.community' },
  { path: '/learning-plan', label: 'nav.learning' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const toggleLocale = () => {
  localeStore.setLocale(locale.value === 'zh' ? 'en' : 'zh')
}
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
