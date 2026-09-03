<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import UserAvatar from './UserAvatar.vue';
import type { PostComment } from '@/data/community';

const props = defineProps<{
  comment: PostComment;
  postId: string;
  depth?: number;
}>();

const { t } = useI18n();
const community = useCommunityStore();

const replying = ref(false);
const replyText = ref('');

const submitReply = () => {
  if (!replyText.value.trim()) return;
  community.addComment(props.postId, replyText.value, props.comment.id);
  replyText.value = '';
  replying.value = false;
};
</script>

<template>
  <div>
    <div class="flex items-start gap-2.5">
      <UserAvatar :user="comment.author" size="sm" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-800">{{ comment.author.name }}</span>
          <span v-if="comment.author.id === 'u_me'" class="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
            {{ t('community.you') }}
          </span>
          <span class="text-[11px] text-slate-400">{{ comment.time }}</span>
        </div>
        <p class="text-sm text-slate-700 leading-relaxed mt-1">{{ comment.content }}</p>
        <div class="flex items-center gap-4 mt-1.5">
          <button class="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {{ comment.likes > 0 ? comment.likes : t('community.like') }}
          </button>
          <button
            class="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
            @click="replying = !replying"
          >
            {{ t('community.reply') }}
          </button>
        </div>

        <!-- 回复输入框 -->
        <div v-if="replying" class="mt-2 flex items-center gap-2">
          <UserAvatar :user="community.currentUser" size="sm" />
          <input
            v-model="replyText"
            type="text"
            :placeholder="t('community.replyPlaceholder')"
            class="flex-1 text-sm bg-slate-50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            @keyup.enter="submitReply"
          />
          <button
            class="px-3 py-1.5 text-xs font-medium text-white rounded-lg btn-primary"
            @click="submitReply"
          >
            {{ t('community.publish') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 楼中楼 -->
    <div
      v-if="comment.replies.length > 0"
      class="mt-3 ml-10 pl-4 border-l-2 border-slate-100 space-y-3"
    >
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :post-id="postId"
        :depth="(depth || 0) + 1"
      />
    </div>
  </div>
</template>
