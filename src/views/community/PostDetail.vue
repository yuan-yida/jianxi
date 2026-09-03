<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import UserAvatar from '@/components/community/UserAvatar.vue';
import TopicBadge from '@/components/community/TopicBadge.vue';
import CommentItem from '@/components/community/CommentItem.vue';
import PostCard from '@/components/community/PostCard.vue';
import SavePostDialog from '@/components/community/SavePostDialog.vue';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const community = useCommunityStore();

const postId = computed(() => route.params.id as string);
const post = computed(() => community.getPost(postId.value));

const commentText = ref('');
const saveDialogOpen = ref(false);
const relatedPosts = computed(() => {
  if (!post.value) return [];
  return community.posts.filter((p) => p.id !== post.value!.id && p.topic === post.value!.topic).slice(0, 3);
});

const submitComment = () => {
  if (!commentText.value.trim() || !post.value) return;
  community.addComment(post.value.id, commentText.value);
  commentText.value = '';
};

const deletePost = async () => {
  if (!post.value) return;
  const ok = await community.removePost(post.value.id);
  if (ok) router.push('/community');
};

const goBack = () => router.back();

watch(post, (val) => {
  if (val === undefined) {
    router.replace('/community');
  }
}, { immediate: true });
</script>

<template>
  <div v-if="post" class="space-y-4">
    <!-- 返回 + 操作 -->
    <div class="flex items-center gap-3">
      <button
        class="w-9 h-9 rounded-lg bg-white hover:bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 transition-colors"
        @click="goBack"
      >
        ←
      </button>
      <span class="text-sm text-slate-400">{{ t('community.back') }}</span>
      <button
        v-if="post.author.id === community.currentUser.id"
        class="ml-auto text-xs text-slate-400 hover:text-rose-500 transition-colors"
        @click="deletePost"
      >
        {{ t('community.delete') }}
      </button>
    </div>

    <!-- 帖子正文 -->
    <article class="card p-6">
      <div class="flex items-start gap-3">
        <UserAvatar :user="post.author" size="lg" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-base font-semibold text-slate-800">{{ post.author.name }}</span>
            <span
              v-if="post.author.id === community.currentUser.id"
              class="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium"
            >{{ t('community.you') }}</span>
            <span class="text-xs text-slate-400">{{ post.time }}</span>
          </div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[11px] text-slate-400">{{ post.author.levelTitle }} · Lv.{{ post.author.level }}</span>
            <span v-if="post.author.streak > 0" class="text-[11px] text-orange-500">🔥 {{ post.author.streak }}</span>
          </div>
        </div>
        <button
          v-if="post.author.id !== community.currentUser.id"
          class="text-xs px-3.5 py-1.5 rounded-lg font-medium transition-colors shrink-0"
          :class="community.isFollowing(post.author.id) ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'"
          @click="community.toggleFollow(post.author.id)"
        >
          {{ community.isFollowing(post.author.id) ? t('community.following.following') : t('community.following.follow') }}
        </button>
      </div>

      <p class="text-[15px] text-slate-800 leading-7 mt-4 whitespace-pre-line">{{ post.content }}</p>

      <div
        v-if="post.card"
        class="mt-4 rounded-xl p-4 bg-gradient-to-br text-white flex items-center gap-4"
        :class="post.card.gradient"
      >
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">{{ post.card.icon }}</div>
        <div>
          <div class="font-semibold text-sm">{{ post.card.title }}</div>
          <div class="text-white/85 text-xs mt-0.5">{{ post.card.content }}</div>
        </div>
      </div>

      <div v-if="post.images > 0" class="grid grid-cols-2 gap-2 mt-4">
        <div
          v-for="i in Math.min(post.images, 2)"
          :key="i"
          class="aspect-[16/9] rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl"
        >
          📷
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-1.5 mt-4">
        <TopicBadge :name="post.topic" :color="post.topicColor" size="md" />
        <span v-for="tag in post.tags" :key="tag" class="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">#{{ tag }}</span>
      </div>

      <!-- 操作栏 -->
      <div class="flex items-center gap-6 mt-5 pt-4 border-t border-slate-100">
        <button
          class="flex items-center gap-1.5 text-sm transition-colors"
          :class="post.liked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'"
          @click="community.toggleLike(post.id)"
        >
          <svg class="w-4 h-4" :fill="post.liked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {{ post.likes.toLocaleString() }} {{ t('community.like') }}
        </button>
        <button
          class="flex items-center gap-1.5 text-sm transition-colors"
          :class="community.isSaved(post.id) ? 'text-amber-500' : 'text-slate-500 hover:text-amber-500'"
          @click="saveDialogOpen = true"
        >
          <svg class="w-4 h-4" :fill="community.isSaved(post.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {{ community.isSaved(post.id) ? t('community.saved') : t('community.save') }}
        </button>
        <span class="flex items-center gap-1.5 text-sm text-slate-400 ml-auto">
          👁 {{ post.views.toLocaleString() }} · 🔗 {{ post.shares }}
        </span>
      </div>
    </article>

    <!-- 评论区 -->
    <div class="card p-5">
      <h3 class="text-base font-semibold text-slate-800 mb-4">
        💬 {{ t('community.comments') }}
        <span class="text-sm font-normal text-slate-400">({{ post.comments.length }})</span>
      </h3>

      <div class="flex items-start gap-3">
        <UserAvatar :user="community.currentUser" size="md" />
        <div class="flex-1">
          <textarea
            v-model="commentText"
            :rows="3"
            :placeholder="t('community.commentPlaceholder')"
            class="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-200"
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              class="px-4 py-2 text-sm font-medium text-white btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!commentText.trim()"
              @click="submitComment"
            >
              {{ t('community.publish') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="post.comments.length > 0" class="space-y-5 mt-6">
        <CommentItem v-for="comment in post.comments" :key="comment.id" :comment="comment" :post-id="post.id" />
      </div>
      <div v-else class="text-center py-10">
        <div class="text-4xl mb-2">🪶</div>
        <p class="text-sm text-slate-400">{{ t('community.emptyComments') }}</p>
      </div>
    </div>

    <!-- 相关推荐 -->
    <div v-if="relatedPosts.length > 0">
      <h3 class="text-base font-semibold text-slate-800 mb-3">📌 {{ t('community.relatedPosts') }}</h3>
      <div class="space-y-4">
        <PostCard v-for="rp in relatedPosts" :key="rp.id" :post="rp" />
      </div>
    </div>

    <SavePostDialog :post-id="post.id" v-model:show="saveDialogOpen" />
  </div>
</template>
