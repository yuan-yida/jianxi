<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@/i18n';
import { useUserStore } from '@/stores/user';

const { t } = useI18n();
const userStore = useUserStore();

interface Article {
  id: number;
  title: string;
  content: string;
  tags: string[];
  date: string;
  views: number;
  likes: number;
  comments: number;
  status: 'published' | 'draft';
}

const articles = ref<Article[]>([
  {
    id: 1, title: '我的英语学习之旅：从零基础到流利对话',
    content: '回顾我过去一年的英语学习经历，分享最有效的方法和踩过的坑...',
    tags: ['学习心得', '经验分享'], date: '3天前', views: 1256, likes: 89, comments: 34, status: 'published',
  },
  {
    id: 2, title: '推荐5个免费的英语听力练习网站',
    content: '整理了5个我常用的免费英语听力资源，适合不同水平的学习者...',
    tags: ['资源推荐', '听力训练'], date: '1周前', views: 2341, likes: 156, comments: 45, status: 'published',
  },
  {
    id: 3, title: '如何克服英语口语中的中式思维',
    content: '中式思维是许多中国学习者面临的共同问题，本文探讨几个实用的解决方法...',
    tags: ['口语技巧', '学习方法'], date: '2周前', views: 876, likes: 67, comments: 23, status: 'published',
  },
  {
    id: 4, title: '商务英语常用表达汇总（草稿）',
    content: '正在整理商务英语中常用的表达方式，包括会议、邮件、谈判等场景...',
    tags: ['商务英语'], date: '3周前', views: 0, likes: 0, comments: 0, status: 'draft',
  },
]);

const showNewArticle = ref(false);
const newTitle = ref('');
const newContent = ref('');

const publishArticle = () => {
  if (!userStore.requireLogin()) return;
  if (!newTitle.value.trim()) return;
  articles.value.unshift({
    id: Date.now(),
    title: newTitle.value,
    content: newContent.value,
    tags: [],
    date: t('community.articles.justNow'),
    views: 0, likes: 0, comments: 0,
    status: 'published',
  });
  newTitle.value = '';
  newContent.value = '';
  showNewArticle.value = false;
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-slate-800">{{ t('community.articles.title') }}</h2>
      <button
        @click="showNewArticle = !showNewArticle"
        class="px-4 py-1.5 bg-indigo-500 text-white rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm"
      >
        {{ showNewArticle ? t('common.cancel') : t('community.articles.write') }}
      </button>
    </div>

    <div v-if="showNewArticle" class="bg-white rounded-xl p-4 border border-indigo-100 space-y-3">
      <input
        v-model="newTitle"
        :placeholder="t('community.articles.titlePlaceholder')"
        class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <textarea
        v-model="newContent"
        :placeholder="t('community.articles.contentPlaceholder')"
        rows="4"
        class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      <div class="flex justify-end gap-2">
        <button @click="showNewArticle = false" class="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-700">
          {{ t('common.cancel') }}
        </button>
        <button
          @click="publishArticle"
          class="px-4 py-1.5 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors"
        >{{ t('community.articles.publish') }}</button>
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="article in articles"
        :key="article.id"
        class="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="article.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
              >
                {{ article.status === 'published' ? t('community.articles.published') : t('community.articles.draft') }}
              </span>
              <span class="text-xs text-slate-400">{{ article.date }}</span>
            </div>
            <h4 class="text-sm font-semibold text-slate-800 mb-1">{{ article.title }}</h4>
            <p class="text-xs text-slate-500 line-clamp-2">{{ article.content }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
          <div class="flex gap-1.5">
            <span v-for="tag in article.tags" :key="tag" class="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
              #{{ tag }}
            </span>
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span>👁️ {{ article.views }}</span>
            <span>❤️ {{ article.likes }}</span>
            <span>💬 {{ article.comments }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
