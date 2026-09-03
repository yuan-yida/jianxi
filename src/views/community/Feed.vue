<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import UserAvatar from '@/components/community/UserAvatar.vue';
import PostCard from '@/components/community/PostCard.vue';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const community = useCommunityStore();

const tabs = [
  { key: 'recommend', label: t('community.recommend') },
  { key: 'following', label: t('community.followingTab') },
  { key: 'latest', label: t('community.latest') },
  { key: 'hot', label: t('community.hot') },
] as const;

const activeTab = ref<'recommend' | 'following' | 'latest' | 'hot'>('recommend');
const searchQuery = ref('');

// 支持从发布页返回后定位到对应 tab
watch(
  () => route.query.tab,
  (val) => {
    if (val && (val === 'recommend' || val === 'following' || val === 'latest' || val === 'hot')) {
      activeTab.value = val;
    }
  },
  { immediate: true },
);

const posts = computed(() => {
  const list = community.sortedPosts(activeTab.value);
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (p) =>
      p.content.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      p.topic.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q),
  );
});

const goCreate = () => router.push('/community/create');
</script>

<template>
  <div class="space-y-4">
    <!-- 发布入口 -->
    <div class="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" @click="goCreate">
      <UserAvatar :user="community.currentUser" size="md" />
      <div class="flex-1 text-sm text-slate-400 bg-slate-50 rounded-full px-4 py-2.5 truncate">
        {{ t('community.sharePlaceholder') }}
      </div>
      <button class="px-4 py-2 text-sm font-medium text-white btn-primary shrink-0">
        {{ t('community.publish') }}
      </button>
    </div>

    <!-- 排序 Tabs + 搜索 -->
    <div class="card p-1.5 flex items-center gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeTab === tab.key ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
      <div class="relative shrink-0">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('community.search')"
          class="w-32 md:w-40 text-sm bg-slate-50 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-200"
        />
        <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div v-if="posts.length > 0" class="space-y-4">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>

    <div v-else class="card p-16 text-center">
      <div class="text-5xl mb-3">🔍</div>
      <p class="text-slate-400 text-sm">{{ t('community.emptyFeed') }}</p>
    </div>
  </div>
</template>
