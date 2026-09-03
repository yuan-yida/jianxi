<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import UserAvatar from '@/components/community/UserAvatar.vue';
import type { PostType } from '@/data/community';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const community = useCommunityStore();

const typeOptions = [
  { key: 'post' as PostType, label: t('community.postType.post'), icon: '📝', desc: t('community.create.postDesc') },
  { key: 'question' as PostType, label: t('community.postType.question'), icon: '❓', desc: t('community.create.questionDesc') },
  { key: 'checkin' as PostType, label: t('community.postType.checkin'), icon: '✅', desc: t('community.create.checkinDesc') },
];

const initialType = route.query.type === 'checkin' || route.query.type === 'question' ? (route.query.type as PostType) : 'post';
const postType = ref<PostType>(initialType);
const content = ref('');
const topicId = ref(community.topics[0]?.id || '');
const tags = ref<string[]>([]);
const tagInput = ref('');
const error = ref('');

const SUGGESTED_TAGS = ['打卡', '口语技巧', '词汇', '听力', '雅思', '职场', '求助', '经验分享'];

const selectedTopic = computed(() => community.topics.find((tp) => tp.id === topicId.value));

const addTag = (tag: string) => {
  const clean = tag.trim().replace(/^#/, '');
  if (!clean || tags.value.includes(clean) || tags.value.length >= 5) return;
  tags.value.push(clean);
  tagInput.value = '';
};

const removeTag = (tag: string) => {
  tags.value = tags.value.filter((x) => x !== tag);
};

const onTagInput = () => {
  if (tagInput.value.includes(',')) {
    addTag(tagInput.value.replace(/,/g, ''));
  } else if (tagInput.value.trim().endsWith(' ')) {
    addTag(tagInput.value);
  }
};

const submit = async () => {
  if (!content.value.trim()) {
    error.value = t('community.create.emptyContent');
    return;
  }
  const card =
    postType.value === 'checkin'
      ? {
          icon: '🔥',
          title: t('community.create.checkinCardTitle'),
          content: t('community.create.checkinCardContent'),
          gradient: 'from-orange-400 to-rose-500',
        }
      : undefined;

  const post = await community.addPost({
    type: postType.value,
    content: content.value,
    topic: selectedTopic.value?.name || community.topics[0].name,
    tags: tags.value,
    card,
  });
  if (post) router.push('/community');
};

const cancel = () => router.back();
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold text-slate-800">✏️ {{ t('community.create.title') }}</h2>

    <!-- 类型选择 -->
    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="opt in typeOptions"
        :key="opt.key"
        class="card p-4 text-left transition-all"
        :class="postType === opt.key ? 'ring-2 ring-indigo-500 border-transparent' : 'hover:shadow-md'"
        @click="postType = opt.key"
      >
        <div class="text-2xl">{{ opt.icon }}</div>
        <div class="text-sm font-semibold text-slate-800 mt-2">{{ opt.label }}</div>
        <div class="text-[11px] text-slate-400 mt-0.5 leading-snug">{{ opt.desc }}</div>
      </button>
    </div>

    <div class="card p-5 space-y-4">
      <!-- 作者行 -->
      <div class="flex items-center gap-3">
        <UserAvatar :user="community.currentUser" size="md" />
        <div>
          <div class="text-sm font-semibold text-slate-800">{{ community.currentUser.name }}</div>
          <div class="text-xs text-slate-400">{{ community.currentUser.levelTitle }} · Lv.{{ community.currentUser.level }}</div>
        </div>
      </div>

      <!-- 内容 -->
      <textarea
        v-model="content"
        :rows="6"
        :placeholder="postType === 'question' ? t('community.create.questionPlaceholder') : t('community.create.contentPlaceholder')"
        class="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none leading-relaxed"
      ></textarea>

      <!-- 话题选择 -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-slate-400 shrink-0">{{ t('community.create.topicLabel') }}</span>
        <button
          v-for="tp in community.topics"
          :key="tp.id"
          class="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
          :class="topicId === tp.id ? 'text-white' : 'text-slate-500 hover:bg-slate-50'"
          :style="topicId === tp.id ? { background: tp.color } : {}"
          @click="topicId = tp.id"
        >
          {{ tp.icon }} {{ tp.name }}
        </button>
      </div>

      <!-- 标签 -->
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-slate-400 shrink-0">{{ t('community.create.tagsLabel') }}</span>
          <span
            v-for="tag in tags"
            :key="tag"
            class="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1"
          >
            #{{ tag }}
            <button class="hover:text-rose-500" @click="removeTag(tag)">×</button>
          </span>
          <input
            v-model="tagInput"
            type="text"
            :placeholder="t('community.create.tagPlaceholder')"
            class="text-xs bg-slate-50 rounded-full px-3 py-1.5 w-32 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            @keyup.enter="addTag(tagInput)"
            @keyup="onTagInput"
          />
        </div>
        <div class="flex flex-wrap gap-1.5 mt-2">
          <button
            v-for="tag in SUGGESTED_TAGS"
            :key="tag"
            class="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            @click="addTag(tag)"
          >
            + {{ tag }}
          </button>
        </div>
      </div>

      <div v-if="error" class="text-xs text-rose-500">{{ error }}</div>
    </div>

    <!-- 操作 -->
    <div class="flex items-center justify-end gap-3">
      <button class="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors" @click="cancel">
        {{ t('community.create.cancel') }}
      </button>
      <button class="px-6 py-2 text-sm font-medium text-white btn-primary" @click="submit">
        {{ t('community.publish') }}
      </button>
    </div>
  </div>
</template>
