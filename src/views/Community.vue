<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import UserAvatar from '@/components/community/UserAvatar.vue';
import SaveTopicDialog from '@/components/community/SaveTopicDialog.vue';

const router = useRouter();
const { t } = useI18n();
const community = useCommunityStore();

const saveTopicDialogId = ref('');

const navItems = computed(() => [
  { key: 'feed', label: t('community.feed'), icon: '🏠', to: '/community', badge: 0 },
  { key: 'explore', label: t('community.explore'), icon: '🧭', to: '/community/explore', badge: 0 },
  { key: 'leaderboard', label: t('community.leaderboard'), icon: '🏆', to: '/community/leaderboard', badge: 0 },
  { key: 'teams', label: t('community.teams'), icon: '👥', to: '/community/teams', badge: 0 },
  { key: 'favorites', label: t('community.favoritesNav'), icon: '🔖', to: '/community/favorites', badge: 0 },
  { key: 'following', label: t('community.myFollowing'), icon: '⭐', to: '/community/following', badge: 0 },
  { key: 'messages', label: t('community.myMessages'), icon: '💬', to: '/community/messages', badge: community.unreadCount },
]);

const isActive = (path: string) => {
  if (path === '/community') return router.currentRoute.value.path === '/community';
  return router.currentRoute.value.path.startsWith(path);
};

const hotTopics = computed(() => community.topics.slice(0, 5));
const topStars = computed(() => community.leaderboard.slice(0, 5));
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 社区横幅 -->
    <div
      class="rounded-2xl p-6 mb-6 text-white relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600"
    >
      <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10"></div>
      <div class="absolute right-24 -bottom-16 w-32 h-32 rounded-full bg-white/10"></div>
      <div class="relative flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold">{{ t('community.title') }}</h1>
          <p class="text-white/80 text-sm mt-1">{{ t('community.desc') }}</p>
          <div class="flex items-center gap-4 mt-3 text-sm">
            <span><b class="text-white">{{ (hotTopics.reduce((s, tp) => s + tp.members, 0)).toLocaleString() }}</b> {{ t('community.stats.members') }}</span>
            <span><b class="text-white">1,286</b> {{ t('community.stats.online') }}</span>
            <span><b class="text-white">{{ community.posts.length.toLocaleString() }}</b> {{ t('community.stats.topics') }}</span>
          </div>
        </div>
        <button
          class="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
          @click="router.push('/community/create')"
        >
          ✏️ {{ t('community.publish') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- 左侧导航 -->
      <aside class="lg:col-span-3 space-y-6">
        <nav class="card p-4 space-y-1 sticky top-20">
          <router-link
            v-for="item in navItems"
            :key="item.key"
            :to="item.to"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline"
            :class="isActive(item.to) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'"
          >
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
            <span
              v-if="item.badge > 0"
              class="ml-auto bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </nav>

        <!-- 我的学习卡片 -->
        <div class="card p-5">
          <div class="flex items-center gap-3">
            <UserAvatar :user="community.currentUser" size="lg" />
            <div class="min-w-0">
              <div class="text-sm font-semibold text-slate-800 truncate">{{ community.currentUser.name }}</div>
              <div class="text-xs text-slate-400 mt-0.5">{{ community.currentUser.levelTitle }} · Lv.{{ community.currentUser.level }}</div>
            </div>
          </div>
          <div class="flex items-center justify-around mt-4 pt-4 border-t border-slate-100 text-center">
            <div>
              <div class="text-base font-bold text-indigo-600">{{ community.currentUser.streak }}</div>
              <div class="text-[11px] text-slate-400">🔥 {{ t('community.streak') }}</div>
            </div>
            <div>
              <div class="text-base font-bold text-indigo-600">{{ community.currentUser.xp.toLocaleString() }}</div>
              <div class="text-[11px] text-slate-400">XP</div>
            </div>
            <div>
              <div class="text-base font-bold text-indigo-600">{{ community.followingUsers.length }}</div>
              <div class="text-[11px] text-slate-400">{{ t('community.stats.following') }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中间内容 -->
      <main class="lg:col-span-6 space-y-6">
        <router-view />
      </main>

      <!-- 右侧信息 -->
      <aside class="lg:col-span-3 space-y-6">
        <!-- 今日打卡 -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-800">📅 {{ t('community.dailyCheckin') }}</h3>
            <router-link to="/community/leaderboard" class="text-xs text-indigo-600 hover:text-indigo-700 no-underline">
              {{ t('community.more') }}
            </router-link>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-slate-500">{{ t('community.streak') }}</span>
            <span class="text-xs font-semibold text-orange-500">🔥 {{ community.currentUser.streak }} {{ t('community.days') }}</span>
          </div>
          <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-500" style="width: 86%"></div>
          </div>
          <div class="text-[11px] text-slate-400 mt-2">{{ t('community.checkinHint') }}</div>
          <router-link
            to="/community/create?type=checkin"
            class="mt-3 w-full block text-center px-4 py-2 text-sm font-medium text-white btn-primary no-underline"
          >
            ✅ {{ t('community.doCheckin') }}
          </router-link>
        </div>

        <!-- 热门话题 -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-800">🔥 {{ t('community.hotTopics') }}</h3>
            <router-link to="/community/explore" class="text-xs text-indigo-600 hover:text-indigo-700 no-underline">
              {{ t('community.more') }}
            </router-link>
          </div>
          <div class="space-y-2.5">
            <div v-for="topic in hotTopics" :key="topic.id" class="flex items-center gap-2">
              <router-link
                :to="{ path: '/community/explore', query: { topic: topic.id } }"
                class="flex items-center gap-2.5 no-underline group flex-1 min-w-0"
              >
                <span
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  :style="{ background: topic.color + '15' }"
                >{{ topic.icon }}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-slate-700 group-hover:text-indigo-600 truncate">#{{ topic.name }}</div>
                  <div class="text-[11px] text-slate-400">{{ topic.posts.toLocaleString() }} {{ t('community.discussions') }}</div>
                </div>
              </router-link>
              <button
                class="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 transition-colors"
                :class="community.isTopicSaved(topic.id) ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500'"
                :title="community.isTopicSaved(topic.id) ? t('community.saved') : t('community.save')"
                @click.stop="saveTopicDialogId = topic.id"
              >
                🔖
              </button>
            </div>
          </div>
        </div>

        <!-- 本周之星 -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-800">⭐ {{ t('community.stars') }}</h3>
            <router-link to="/community/leaderboard" class="text-xs text-indigo-600 hover:text-indigo-700 no-underline">
              {{ t('community.thisWeek') }}
            </router-link>
          </div>
          <div class="space-y-2.5">
            <div v-for="(entry, idx) in topStars" :key="entry.user.id" class="flex items-center gap-3">
              <span class="w-5 text-center text-sm font-bold" :class="idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-300'">
                {{ idx + 1 }}
              </span>
              <UserAvatar :user="entry.user" size="sm" />
              <div class="flex-1 min-w-0">
                <div class="text-sm text-slate-700 font-medium truncate">{{ entry.user.name }}</div>
              </div>
              <div class="text-xs font-semibold text-indigo-600">{{ entry.xp }} XP</div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <SaveTopicDialog
      :topic-id="saveTopicDialogId"
      :show="saveTopicDialogId !== ''"
      @update:show="(v: boolean) => { if (!v) saveTopicDialogId = '' }"
    />
  </div>
</template>
