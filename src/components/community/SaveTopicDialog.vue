<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';
import CollectionForm from './CollectionForm.vue';

const props = defineProps<{ topicId: string; show: boolean }>();
const emit = defineEmits<{ (e: 'update:show', v: boolean): void }>();

const { t } = useI18n();
const community = useCommunityStore();

const topic = computed(() => community.topics.find((tp) => tp.id === props.topicId));
const selected = ref<string[]>([]);
const showCreate = ref(false);

watch(
  () => props.show,
  (open) => {
    if (!open) return;
    const rec = community.getTopicSavedRecord(props.topicId);
    selected.value = rec ? [...rec.collectionIds] : [];
    showCreate.value = false;
  },
);

const isSaved = computed(() => community.isTopicSaved(props.topicId));
const savedCollections = computed(() =>
  community.favoriteCollections.filter((c) => selected.value.includes(c.id)),
);

const close = () => emit('update:show', false);

const toggleCollection = (id: string) => {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id];
};

const confirmSave = () => {
  community.saveTopic(props.topicId, selected.value);
  close();
};

const removeSave = () => {
  community.unsaveTopic(props.topicId);
  close();
};

const onCreated = (v: { name: string; icon: string; color: string }) => {
  const c = community.createCollection(v);
  if (!c) return;
  selected.value.push(c.id);
  showCreate.value = false;
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="topic && show"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      @click.self="close"
    >
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      <div class="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl max-h-[85vh] overflow-y-auto">
        <!-- 头部 -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-800">🔖 {{ t('community.favorites.saveTopicTitle') }}</h3>
          <button class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors" @click="close">
            ✕
          </button>
        </div>

        <!-- 话题摘要 -->
        <div class="flex items-center gap-3 bg-slate-50 rounded-xl p-3 mb-4">
          <span class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" :style="{ background: topic.color + '15' }">
            {{ topic.icon }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold text-slate-800">#{{ topic.name }}</div>
            <p class="text-xs text-slate-400 truncate">{{ topic.description }}</p>
            <div class="text-[11px] text-slate-400 mt-0.5">
              {{ topic.posts.toLocaleString() }} {{ t('community.discussions') }} · 👥 {{ topic.members.toLocaleString() }}
            </div>
          </div>
          <span v-if="isSaved" class="text-[10px] px-2 py-1 rounded-full bg-amber-50 text-amber-600 font-medium shrink-0">
            {{ t('community.saved') }}
          </span>
        </div>

        <!-- 收藏夹多选 -->
        <div class="mb-3">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-medium text-slate-500">{{ t('community.favorites.chooseFolder') }}</label>
            <button class="text-xs text-indigo-600 hover:text-indigo-700 transition-colors" @click="showCreate = !showCreate">
              ＋ {{ t('community.favorites.newFolder') }}
            </button>
          </div>

          <div v-if="showCreate" class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 mb-2">
            <CollectionForm @created="onCreated" @cancel="showCreate = false" />
          </div>

          <div class="space-y-1.5">
            <button
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors"
              :class="selected.length === 0 ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:bg-slate-50 text-slate-600'"
              @click="selected = []"
            >
              <span class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm">🗃️</span>
              <span>{{ t('community.favorites.uncategorized') }}</span>
              <span class="ml-auto text-[11px] text-slate-400">
                {{ community.savedTopicViews.filter((v) => v.collectionIds.length === 0).length }}
              </span>
            </button>
            <button
              v-for="c in community.favoriteCollections"
              :key="c.id"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors"
              :class="selected.includes(c.id) ? 'font-medium' : 'hover:bg-slate-50 text-slate-600'"
              :style="selected.includes(c.id) ? { background: c.color + '14', color: c.color } : {}"
              @click="toggleCollection(c.id)"
            >
              <span class="w-7 h-7 rounded-lg flex items-center justify-center text-sm" :style="{ background: c.color + '15' }">{{ c.icon }}</span>
              <span>{{ c.name }}</span>
              <span class="ml-auto text-[11px] opacity-70">{{ community.savedTopicsOfCollection(c.id).length }}</span>
              <span
                v-if="selected.includes(c.id)"
                class="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                :style="{ background: c.color }"
              >✓</span>
            </button>
          </div>
        </div>

        <!-- 已收藏提示 -->
        <p v-if="isSaved" class="text-[11px] text-slate-400 mb-3">
          {{ t('community.favorites.savedIn') }}
          <template v-if="savedCollections.length > 0">
            <span
              v-for="c in savedCollections"
              :key="c.id"
              class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium mx-0.5"
              :style="{ background: c.color + '15', color: c.color }"
            >{{ c.icon }} {{ c.name }}</span>
          </template>
          <template v-else>{{ t('community.favorites.uncategorized') }}</template>
        </p>

        <!-- 操作 -->
        <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
          <button
            v-if="isSaved"
            class="text-sm text-slate-400 hover:text-rose-500 transition-colors"
            @click="removeSave"
          >
            {{ t('community.favorites.unsave') }}
          </button>
          <button class="flex-1 px-4 py-2.5 text-sm font-medium text-white btn-primary" @click="confirmSave">
            {{ t('community.favorites.confirmSave') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
