<script setup lang="ts">
import { useI18n } from '@/i18n';
import { useUserStore } from '@/stores/user';
import { useCommunityStore } from '@/stores/community';
import UserAvatar from '@/components/community/UserAvatar.vue';

const { t } = useI18n();
const userStore = useUserStore();
const community = useCommunityStore();
</script>

<template>
  <div class="space-y-4">
    <!-- 未登录提示 -->
    <div v-if="!userStore.isLoggedIn" class="card p-4 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100">
      <span class="text-xl">🔐</span>
      <p class="flex-1 text-sm text-indigo-700">{{ t('community.loginBanner') }}</p>
      <router-link
        :to="{ path: '/auth', query: { redirect: '/community/following' } }"
        class="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
      >
        {{ t('community.loginNow') }}
      </router-link>
    </div>

    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-slate-800">⭐ {{ t('community.myFollowing') }}</h2>
      <span class="text-sm text-slate-400">{{ community.followingUsers.length }} {{ t('community.following.count') }}</span>
    </div>

    <div v-if="community.followingUsers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        v-for="user in community.followingUsers"
        :key="user.id"
        class="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
      >
        <UserAvatar :user="user" size="md" />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-slate-800 truncate">{{ user.name }}</div>
          <div class="text-[11px] text-slate-400 truncate mt-0.5">{{ user.bio }}</div>
          <div class="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
            <span>🔥 {{ user.streak }} {{ t('community.days') }}</span>
            <span>Lv.{{ user.level }}</span>
          </div>
        </div>
        <button
          class="text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors"
          :class="community.isFollowing(user.id) ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'"
          @click="community.toggleFollow(user.id)"
        >
          {{ community.isFollowing(user.id) ? t('community.following.following') : t('community.following.follow') }}
        </button>
      </div>
    </div>

    <div v-else class="card p-16 text-center">
      <div class="text-5xl mb-3">👀</div>
      <p class="text-slate-400 text-sm">{{ t('community.following.empty') }}</p>
    </div>
  </div>
</template>
