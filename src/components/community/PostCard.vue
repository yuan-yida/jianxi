<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import UserAvatar from './UserAvatar.vue';
import TopicBadge from './TopicBadge.vue';
import SavePostDialog from './SavePostDialog.vue';
import type { Post } from '@/data/community';

const props = defineProps<{ post: Post }>();

const router = useRouter();
const { t } = useI18n();
const community = useCommunityStore();
const saveDialogOpen = ref(false);

const typeLabel = (post: Post) => {
  if (post.type === 'question') return t('community.postType.question');
  if (post.type === 'checkin') return t('community.postType.checkin');
  return t('community.postType.post');
};

const typeStyle = (post: Post) => {
  if (post.type === 'question') return 'bg-blue-50 text-blue-600';
  if (post.type === 'checkin') return 'bg-emerald-50 text-emerald-600';
  return 'bg-slate-100 text-slate-600';
};

const openDetail = () => {
  router.push(`/community/post/${props.post.id}`);
};
</script>

<template>
  <article class="card p-5 hover:shadow-md transition-shadow cursor-pointer" @click="openDetail">
    <!-- 作者行 -->
    <div class="flex items-start gap-3">
      <UserAvatar :user="post.author" size="md" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-slate-800 truncate">{{ post.author.name }}</span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
            :class="typeStyle(post)"
          >
            {{ typeLabel(post) }}
          </span>
          <span v-if="post.author.isAccount && post.author.id === community.currentUser.id" class="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium shrink-0">
            {{ t('community.you') }}
          </span>
          <span class="text-xs text-slate-400 ml-auto shrink-0">{{ post.time }}</span>
        </div>
        <div class="flex items-center gap-2 mt-0.5">
          <span class="text-[11px] text-slate-400">{{ post.author.levelTitle }} · Lv.{{ post.author.level }}</span>
          <span v-if="post.author.streak > 0" class="text-[11px] text-orange-500">🔥 {{ post.author.streak }}</span>
        </div>
      </div>
    </div>

    <!-- 正文 -->
    <p class="text-sm text-slate-700 leading-relaxed mt-3 whitespace-pre-line">{{ post.content }}</p>

    <!-- 打卡/成果卡 -->
    <div
      v-if="post.card"
      class="mt-3 rounded-xl p-4 bg-gradient-to-br text-white flex items-center gap-4"
      :class="post.card.gradient"
    >
      <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">{{ post.card.icon }}</div>
      <div class="min-w-0">
        <div class="font-semibold text-sm">{{ post.card.title }}</div>
        <div class="text-white/85 text-xs mt-0.5">{{ post.card.content }}</div>
      </div>
    </div>

    <!-- 模拟配图 -->
    <div v-if="post.images > 0" class="grid grid-cols-2 gap-2 mt-3">
      <div
        v-for="i in Math.min(post.images, 2)"
        :key="i"
        class="aspect-[16/9] rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl"
      >
        📷
      </div>
    </div>

    <!-- 话题与标签 -->
    <div class="flex flex-wrap items-center gap-1.5 mt-3">
      <TopicBadge :name="post.topic" :color="post.topicColor" />
      <span
        v-for="tag in post.tags"
        :key="tag"
        class="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-600"
      >#{{ tag }}</span>
    </div>

    <!-- 操作栏 -->
    <div class="flex items-center gap-5 mt-4 pt-3 border-t border-slate-100">
      <button
        @click.stop="community.toggleLike(post.id)"
        class="flex items-center gap-1.5 text-sm transition-colors"
        :class="post.liked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'"
      >
        <svg class="w-4 h-4" :fill="post.liked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {{ post.likes > 0 ? post.likes.toLocaleString() : t('community.like') }}
      </button>
      <button class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {{ post.comments.length > 0 ? post.comments.length : t('community.comment') }}
      </button>
      <button
        @click.stop="saveDialogOpen = true"
        class="flex items-center gap-1.5 text-sm transition-colors"
        :class="community.isSaved(post.id) ? 'text-amber-500' : 'text-slate-500 hover:text-amber-500'"
      >
        <svg class="w-4 h-4" :fill="community.isSaved(post.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        {{ community.isSaved(post.id) ? t('community.saved') : t('community.save') }}
      </button>
      <button
        @click.stop
        class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors ml-auto"
        :title="t('community.share')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {{ post.shares > 0 ? post.shares : t('community.share') }}
      </button>
    </div>

    <SavePostDialog :post-id="post.id" v-model:show="saveDialogOpen" />
  </article>
</template>
