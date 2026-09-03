<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import UserAvatar from '@/components/community/UserAvatar.vue';

const { t } = useI18n();
const community = useCommunityStore();

type RankMode = 'xp' | 'streak' | 'minutes';

const mode = ref<RankMode>('xp');

const modes = [
  { key: 'xp' as RankMode, label: t('community.rank.weekly') },
  { key: 'streak' as RankMode, label: t('community.rank.streak') },
  { key: 'minutes' as RankMode, label: t('community.rank.minutes') },
];

const ranking = computed(() =>
  [...community.leaderboard].sort((a, b) => {
    if (mode.value === 'streak') return b.streak - a.streak;
    if (mode.value === 'minutes') return b.minutes - a.minutes;
    return b.xp - a.xp;
  }),
);

const valueOf = (key: RankMode, entry: (typeof ranking.value)[number]) => {
  if (key === 'streak') return `🔥 ${entry.streak} ${t('community.days')}`;
  if (key === 'minutes') return `${entry.minutes} min`;
  return `${entry.xp} XP`;
};

const medals = ['🥇', '🥈', '🥉'];
const myEntry = computed(() => ({
  user: community.currentUser,
  xp: community.currentUser.xp,
  minutes: 120,
  streak: community.currentUser.streak,
  rank: community.currentRank,
}));

const LEVELS = [
  { level: 1, title: '🌱 初学者', min: 0 },
  { level: 3, title: '⭐ 勤学之星', min: 2000 },
  { level: 5, title: '🚀 进阶达人', min: 5000 },
  { level: 7, title: '🏅 口语专家', min: 10000 },
  { level: 9, title: '🏆 社区导师', min: 15000 },
];

const nextLevel = computed(() => LEVELS.find((lv) => lv.min > community.currentUser.xp));
const currentLevelIndex = computed(() =>
  Math.max(0, LEVELS.findIndex((lv) => lv.min <= community.currentUser.xp)),
);
const levelProgress = computed(() => {
  const cur = LEVELS[currentLevelIndex.value];
  const next = nextLevel.value;
  if (!next) return 100;
  return Math.min(100, Math.round(((community.currentUser.xp - cur.min) / (next.min - cur.min)) * 100));
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="text-lg font-bold text-slate-800">🏆 {{ t('community.leaderboard') }}</h2>
      <div class="flex gap-2">
        <button
          v-for="m in modes"
          :key="m.key"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          :class="mode === m.key ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50'"
          @click="mode = m.key"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- 我的等级进度 -->
    <div class="card p-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-semibold text-slate-800">
          {{ t('community.rank.myLevel') }} · {{ LEVELS[currentLevelIndex].title }}
        </span>
        <span class="text-xs text-slate-400">
          {{ community.currentUser.xp.toLocaleString() }} XP
          <template v-if="nextLevel"> / {{ nextLevel.min.toLocaleString() }} XP</template>
        </span>
      </div>
      <div class="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" :style="{ width: levelProgress + '%' }"></div>
      </div>
      <div class="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
        <span>{{ t('community.rank.levelTip') }}</span>
        <span v-if="nextLevel">{{ nextLevel.title }}</span>
      </div>
    </div>

    <!-- 前三名领奖台 -->
    <div class="card p-6">
      <div class="grid grid-cols-3 gap-3 items-end">
        <div v-for="entry in ranking.slice(0, 3)" :key="entry.user.id" class="text-center">
          <div v-if="entry === ranking[1]" class="text-3xl mb-1">🥈</div>
          <div v-else-if="entry === ranking[0]" class="text-4xl mb-1">🥇</div>
          <div v-else class="text-3xl mb-1">🥉</div>
          <div class="flex justify-center">
            <UserAvatar :user="entry.user" :size="entry === ranking[0] ? 'xl' : 'lg'" />
          </div>
          <div class="text-sm font-semibold text-slate-800 mt-2 truncate">{{ entry.user.name }}</div>
          <div class="text-xs font-bold mt-0.5" :class="mode === 'xp' ? 'text-indigo-600' : 'text-orange-500'">
            {{ valueOf(mode, entry) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 完整榜单 -->
    <div class="card p-2">
      <div
        v-for="entry in ranking"
        :key="entry.user.id"
        class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
      >
        <span class="w-7 text-center text-sm font-bold text-slate-400">{{ entry.rank }}</span>
        <UserAvatar :user="entry.user" size="sm" />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-slate-700 truncate">{{ entry.user.name }}</div>
          <div class="text-[11px] text-slate-400">🔥 {{ entry.user.streak }} {{ t('community.days') }}</div>
        </div>
        <div class="text-sm font-semibold" :class="mode === 'xp' ? 'text-indigo-600' : 'text-orange-500'">
          {{ valueOf(mode, entry) }}
        </div>
      </div>
    </div>

    <!-- 我的排名 -->
    <div class="card p-4 flex items-center gap-3 ring-2 ring-indigo-100">
      <span class="w-7 text-center text-sm font-bold text-indigo-600">#{{ myEntry.rank }}</span>
      <UserAvatar :user="myEntry.user" size="md" />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold text-slate-800">{{ myEntry.user.name }}</div>
        <div class="text-[11px] text-slate-400">{{ myEntry.user.levelTitle }}</div>
      </div>
      <div class="text-sm font-semibold text-indigo-600">{{ valueOf('xp', myEntry) }}</div>
    </div>
  </div>
</template>
