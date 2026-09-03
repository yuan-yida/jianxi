<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import PostCard from '@/components/community/PostCard.vue';
import SaveTopicDialog from '@/components/community/SaveTopicDialog.vue';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const community = useCommunityStore();

const filter = ref<'all' | 'subscribed'>('all');
const search = ref('');
const saveTopicDialogId = ref('');

const selectedTopicId = computed(() => (route.query.topic as string) || '');

const selectedTopic = computed(() => community.topics.find((tp) => tp.id === selectedTopicId.value));

const visibleTopics = computed(() => {
  let list = community.topics;
  if (filter.value === 'subscribed') list = list.filter((tp) => tp.subscribed);
  const q = search.value.trim().toLowerCase();
  if (q) list = list.filter((tp) => tp.name.toLowerCase().includes(q) || tp.description.toLowerCase().includes(q));
  return list;
});

const topicPosts = computed(() => {
  if (!selectedTopic.value) return [];
  return community.posts.filter((p) => p.topic === selectedTopic.value?.name);
});

const backToList = () => router.push('/community/explore');
</script>

<template>
  <div class="space-y-4">
    <!-- 话题板块浏览 -->
    <template v-if="!selectedTopic">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-800">🧭 {{ t('community.explore') }}</h2>
        <div class="relative">
          <input
            v-model="search"
            type="text"
            :placeholder="t('community.searchTopic')"
            class="w-44 text-sm bg-white border border-slate-100 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-200"
          />
          <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          :class="filter === 'all' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50'"
          @click="filter = 'all'"
        >
          {{ t('community.all') }}
        </button>
        <button
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          :class="filter === 'subscribed' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50'"
          @click="filter = 'subscribed'"
        >
          {{ t('community.subscribed') }}
        </button>
      </div>

      <div v-if="visibleTopics.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="topic in visibleTopics"
          :key="topic.id"
          class="card p-5 hover:shadow-md transition-shadow cursor-pointer group"
          @click="router.push({ path: '/community/explore', query: { topic: topic.id } })"
        >
          <div class="flex items-start justify-between">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              :style="{ background: topic.color + '15' }"
            >{{ topic.icon }}</div>
            <button
              class="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              :class="topic.subscribed ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'"
              @click.stop="community.toggleSubscribeTopic(topic.id)"
            >
              {{ topic.subscribed ? t('community.subscribed') : t('community.subscribe') }}
            </button>
          </div>
          <h3 class="text-base font-semibold text-slate-800 mt-3 group-hover:text-indigo-600 transition-colors">#{{ topic.name }}</h3>
          <p class="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">{{ topic.description }}</p>
          <div class="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
            <span>{{ topic.posts.toLocaleString() }} {{ t('community.discussions') }}</span>
            <span>👥 {{ topic.members.toLocaleString() }} {{ t('community.members') }}</span>
            <button
              class="ml-auto text-xs px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0"
              :class="community.isTopicSaved(topic.id) ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500'"
              @click.stop="saveTopicDialogId = topic.id"
            >
              🔖 {{ community.isTopicSaved(topic.id) ? t('community.saved') : t('community.save') }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="card p-16 text-center">
        <div class="text-5xl mb-3">🗂️</div>
        <p class="text-slate-400 text-sm">{{ t('community.emptyTopics') }}</p>
      </div>
    </template>

    <!-- 话题下的帖子流 -->
    <template v-else>
      <div class="card p-4 flex items-center gap-3">
        <button
          class="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          @click="backToList"
        >
          ←
        </button>
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
          :style="{ background: selectedTopic.color + '15' }"
        >{{ selectedTopic.icon }}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-slate-800">#{{ selectedTopic.name }}</h2>
            <span class="text-[11px] px-2 py-0.5 rounded-full" :style="{ background: selectedTopic.color + '15', color: selectedTopic.color }">
              {{ selectedTopic.posts.toLocaleString() }} {{ t('community.discussions') }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5 truncate">{{ selectedTopic.description }}</p>
        </div>
        <button
          class="text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors"
          :class="community.isTopicSaved(selectedTopic.id) ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500'"
          @click="saveTopicDialogId = selectedTopic.id"
        >
          🔖 {{ community.isTopicSaved(selectedTopic.id) ? t('community.saved') : t('community.save') }}
        </button>
        <button
          class="text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors"
          :class="selectedTopic.subscribed ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'"
          @click="community.toggleSubscribeTopic(selectedTopic.id)"
        >
          {{ selectedTopic.subscribed ? t('community.subscribed') : t('community.subscribe') }}
        </button>
      </div>

      <div v-if="topicPosts.length > 0" class="space-y-4">
        <PostCard v-for="post in topicPosts" :key="post.id" :post="post" />
      </div>
      <div v-else class="card p-16 text-center">
        <div class="text-5xl mb-3">📭</div>
        <p class="text-slate-400 text-sm">{{ t('community.emptyTopicPosts') }}</p>
      </div>
    </template>

    <SaveTopicDialog
      :topic-id="saveTopicDialogId"
      :show="saveTopicDialogId !== ''"
      @update:show="(v: boolean) => { if (!v) saveTopicDialogId = '' }"
    />
  </div>
</template>
