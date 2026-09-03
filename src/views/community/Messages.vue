<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import type { NotificationType } from '@/data/community';

const { t } = useI18n();
const community = useCommunityStore();

const tab = ref<'all' | 'like' | 'comment' | 'follow' | 'system'>('all');

const tabs = [
  { key: 'all' as const, label: t('community.messages.all') },
  { key: 'like' as const, label: t('community.messages.likes') },
  { key: 'comment' as const, label: t('community.messages.comments') },
  { key: 'follow' as const, label: t('community.messages.follows') },
  { key: 'system' as const, label: t('community.messages.system') },
];

const filtered = computed(() => {
  if (tab.value === 'all') return community.notifications;
  return community.notifications.filter((n) => n.type === (tab.value as NotificationType));
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="text-lg font-bold text-slate-800">💬 {{ t('community.myMessages') }}</h2>
      <button class="text-xs text-indigo-600 hover:text-indigo-700 transition-colors" @click="community.markAllRead()">
        ✓ {{ t('community.messages.markAllRead') }}
      </button>
    </div>

    <div class="flex gap-2 flex-wrap">
      <button
        v-for="item in tabs"
        :key="item.key"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
        :class="tab === item.key ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50'"
        @click="tab = item.key"
      >
        {{ item.label }}
      </button>
    </div>

    <div v-if="filtered.length > 0" class="card divide-y divide-slate-100">
      <div
        v-for="n in filtered"
        :key="n.id"
        class="flex items-start gap-3 px-5 py-4 transition-colors"
        :class="n.read ? '' : 'bg-indigo-50/40'"
        @click="community.markNotificationRead(n.id)"
      >
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          :class="n.read ? 'bg-slate-50' : 'bg-indigo-100/60'"
        >
          {{ n.icon }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-slate-700 leading-relaxed">{{ n.text }}</p>
          <span class="text-[11px] text-slate-400">{{ n.time }}</span>
        </div>
        <span v-if="!n.read" class="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
      </div>
    </div>

    <div v-else class="card p-16 text-center">
      <div class="text-5xl mb-3">📭</div>
      <p class="text-slate-400 text-sm">{{ t('community.messages.empty') }}</p>
    </div>
  </div>
</template>
