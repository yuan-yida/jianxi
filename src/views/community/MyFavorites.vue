<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@/i18n';
import { useUserStore } from '@/stores/user';
import { useCommunityStore } from '@/stores/community';
import { formatRelativeTime } from '@/utils/time';
import UserAvatar from '@/components/community/UserAvatar.vue';
import TopicBadge from '@/components/community/TopicBadge.vue';
import CollectionForm from '@/components/community/CollectionForm.vue';
import type { FavoriteCollection, SavedItemView } from '@/data/community';

const router = useRouter();
const { t } = useI18n();
const userStore = useUserStore();
const community = useCommunityStore();

type FolderKey = 'all' | 'uncategorized' | string;
type TypeFilter = 'all' | 'post' | 'topic';

const activeFolder = ref<FolderKey>('all');
const typeFilter = ref<TypeFilter>('all');
const search = ref('');
const showManage = ref(false);
const renamingId = ref('');
const renamingName = ref('');
const deletingId = ref('');

const typeTabs: { key: TypeFilter; label: string; icon: string }[] = [
  { key: 'all', label: t('community.favorites.all'), icon: '🗃️' },
  { key: 'post', label: t('community.favorites.posts'), icon: '💬' },
  { key: 'topic', label: t('community.favorites.topics'), icon: '🧭' },
];

const folderTabs = computed(() => [
  {
    key: 'all',
    label: t('community.favorites.all'),
    icon: '🗃️',
    color: '#64748b',
    count: community.savedItems.length,
  },
  {
    key: 'uncategorized',
    label: t('community.favorites.uncategorized'),
    icon: '📄',
    color: '#94a3b8',
    count: community.savedItems.filter((v) => v.collectionIds.length === 0).length,
  },
  ...community.favoriteCollections.map((c) => ({
    key: c.id,
    label: c.name,
    icon: c.icon,
    color: c.color,
    count: community.savedItemsOfCollection(c.id).length,
  })),
]);

const filtered = computed<SavedItemView[]>(() => {
  let list = community.savedItems;
  if (typeFilter.value === 'post') list = list.filter((v) => v.kind === 'post');
  else if (typeFilter.value === 'topic') list = list.filter((v) => v.kind === 'topic');

  if (activeFolder.value === 'uncategorized') list = list.filter((v) => v.collectionIds.length === 0);
  else if (activeFolder.value !== 'all') list = list.filter((v) => v.collectionIds.includes(activeFolder.value as string));

  const q = search.value.trim().toLowerCase();
  if (q) {
    list = list.filter((v) => {
      if (v.kind === 'post') {
        return (
          v.post!.content.toLowerCase().includes(q) ||
          v.post!.topic.toLowerCase().includes(q) ||
          v.post!.author.name.toLowerCase().includes(q) ||
          v.post!.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return (
        v.topic!.name.toLowerCase().includes(q) ||
        v.topic!.description.toLowerCase().includes(q)
      );
    });
  }
  return list;
});

const collectionsOf = (ids: string[]) =>
  ids.map((id) => community.getCollection(id)).filter((c): c is FavoriteCollection => Boolean(c));

const startRename = (c: FavoriteCollection) => {
  renamingId.value = c.id;
  renamingName.value = c.name;
};

const commitRename = () => {
  community.renameCollection(renamingId.value, renamingName.value);
  renamingId.value = '';
};

// 两次点击确认删除（收藏内容将移入未分类）
const onDelete = (c: FavoriteCollection) => {
  if (deletingId.value !== c.id) {
    deletingId.value = c.id;
    return;
  }
  community.deleteCollection(c.id);
  if (activeFolder.value === c.id) activeFolder.value = 'all';
  deletingId.value = '';
};

const onCreated = (v: { name: string; icon: string; color: string }) => {
  const c = community.createCollection(v);
  if (!c) return;
  activeFolder.value = c.id;
  showManage.value = false;
};

const openPost = (id: string) => router.push(`/community/post/${id}`);
const openTopic = (id: string) => router.push({ path: '/community/explore', query: { topic: id } });
</script>

<template>
  <div class="space-y-4">
    <!-- 未登录提示 -->
    <div v-if="!userStore.isLoggedIn" class="card p-4 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100">
      <span class="text-xl">🔐</span>
      <p class="flex-1 text-sm text-indigo-700">{{ t('community.loginBanner') }}</p>
      <router-link
        :to="{ path: '/auth', query: { redirect: '/community/favorites' } }"
        class="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
      >
        {{ t('community.loginNow') }}
      </router-link>
    </div>

    <!-- 头部 -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 class="text-lg font-bold text-slate-800">🔖 {{ t('community.favorites.title') }}</h2>
        <p class="text-xs text-slate-400 mt-0.5">
          {{ community.savedPostViews.length }} {{ t('community.favorites.posts') }} ·
          {{ community.savedTopicViews.length }} {{ t('community.favorites.topics') }} ·
          {{ community.favoriteCollections.length }} {{ t('community.favorites.folders') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          @click="showManage = true"
        >
          ⚙️ {{ t('community.favorites.manage') }}
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-xl"
          @click="showManage = true"
        >
          ＋ {{ t('community.favorites.newFolder') }}
        </button>
      </div>
    </div>

    <!-- 内容类型筛选 -->
    <div class="card p-1.5 flex items-center gap-1">
      <button
        v-for="tab in typeTabs"
        :key="tab.key"
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="typeFilter === tab.key ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'"
        @click="typeFilter = tab.key"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- 收藏夹筛选 -->
    <div class="flex gap-2 flex-wrap items-center">
      <button
        v-for="folder in folderTabs"
        :key="folder.key"
        class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
        :class="activeFolder === folder.key ? 'text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50'"
        :style="activeFolder === folder.key ? { background: folder.color } : {}"
        @click="activeFolder = folder.key"
      >
        <span>{{ folder.icon }}</span>
        <span>{{ folder.label }}</span>
        <span class="text-[11px] opacity-80">{{ folder.count }}</span>
      </button>

      <div class="relative ml-auto">
        <input
          v-model="search"
          type="text"
          :placeholder="t('community.favorites.search')"
          class="w-40 md:w-48 text-sm bg-white border border-slate-100 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-200"
        />
        <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- 收藏列表 -->
    <div v-if="filtered.length > 0" class="space-y-3">
      <!-- 帖子收藏 -->
      <article
        v-for="item in filtered"
        :key="item.kind + item.post?.id + item.topic?.id"
        class="card p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="item.kind === 'post' && item.post ? openPost(item.post.id) : item.topic && openTopic(item.topic.id)"
      >
        <template v-if="item.kind === 'post' && item.post">
          <div class="flex items-center gap-2">
            <UserAvatar :user="item.post.author" size="sm" />
            <span class="text-xs font-semibold text-slate-700 truncate">{{ item.post.author.name }}</span>
            <span class="text-[11px] text-slate-400 shrink-0">
              {{ t('community.favorites.timeLabel') }} {{ formatRelativeTime(item.savedAt, t) }}
            </span>
            <span class="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 shrink-0">💬 {{ t('community.favorites.posts') }}</span>
          </div>
          <p class="text-sm text-slate-700 leading-relaxed mt-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            {{ item.post.content }}
          </p>
          <div class="flex items-center gap-1.5 mt-2.5">
            <TopicBadge :name="item.post.topic" :color="item.post.topicColor" />
            <span
              v-for="c in collectionsOf(item.collectionIds)"
              :key="c.id"
              class="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
              :style="{ background: c.color + '15', color: c.color }"
            >{{ c.icon }} {{ c.name }}</span>
            <div class="ml-auto flex items-center gap-1.5 shrink-0">
              <button
                class="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                @click.stop="community.unsavePost(item.post.id)"
              >
                🗑 {{ t('community.favorites.unsave') }}
              </button>
            </div>
          </div>
        </template>

        <!-- 话题收藏 -->
        <template v-else-if="item.topic">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" :style="{ background: item.topic.color + '15' }">
              {{ item.topic.icon }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-800">#{{ item.topic.name }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 shrink-0">🧭 {{ t('community.favorites.topics') }}</span>
              </div>
              <div class="text-xs text-slate-400 truncate">{{ item.topic.description }}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">
                {{ item.topic.posts.toLocaleString() }} {{ t('community.discussions') }} · 👥 {{ item.topic.members.toLocaleString() }}
              </div>
            </div>
            <div class="shrink-0 text-right">
              <div class="text-[11px] text-slate-400">
                {{ t('community.favorites.timeLabel') }}
              </div>
              <div class="text-[11px] text-slate-400">{{ formatRelativeTime(item.savedAt, t) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-1.5 mt-2.5 pl-[52px]">
            <span
              v-for="c in collectionsOf(item.collectionIds)"
              :key="c.id"
              class="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
              :style="{ background: c.color + '15', color: c.color }"
            >{{ c.icon }} {{ c.name }}</span>
            <div class="ml-auto flex items-center gap-1.5 shrink-0">
              <button
                class="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                @click.stop="openTopic(item.topic.id)"
              >
                {{ t('community.explore') }}
              </button>
              <button
                class="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                @click.stop="community.unsaveTopic(item.topic.id)"
              >
                🗑 {{ t('community.favorites.unsave') }}
              </button>
            </div>
          </div>
        </template>
      </article>
    </div>

    <div v-else class="card p-16 text-center">
      <div class="text-5xl mb-3">🔖</div>
      <p class="text-slate-400 text-sm">
        {{ activeFolder === 'all' && !search ? t('community.favorites.empty') : t('community.favorites.emptyFolder') }}
      </p>
    </div>

    <!-- 收藏夹管理弹层 -->
    <Teleport to="body">
      <div v-if="showManage" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center" @click.self="showManage = false">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
        <div class="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-slate-800">⚙️ {{ t('community.favorites.manage') }}</h3>
            <button class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors" @click="showManage = false">
              ✕
            </button>
          </div>

          <!-- 新建收藏夹 -->
          <div class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mb-4">
            <div class="text-xs font-medium text-indigo-600 mb-2">＋ {{ t('community.favorites.newFolder') }}</div>
            <CollectionForm @created="onCreated" @cancel="showManage = false" />
          </div>

          <!-- 收藏夹列表 -->
          <div class="space-y-2">
            <div
              v-for="c in community.favoriteCollections"
              :key="c.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span
                class="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                :style="{ background: c.color + '15' }"
              >{{ c.icon }}</span>
              <div class="flex-1 min-w-0">
                <template v-if="renamingId === c.id">
                  <input
                    v-model="renamingName"
                    type="text"
                    maxlength="12"
                    class="w-full text-sm bg-slate-50 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                    @keyup.enter="commitRename"
                    @keyup.esc="renamingId = ''"
                  />
                </template>
                <template v-else>
                  <div class="text-sm font-medium text-slate-700 truncate">{{ c.name }}</div>
                  <div class="text-[11px] text-slate-400">{{ community.savedItemsOfCollection(c.id).length }} {{ t('community.favorites.count') }}</div>
                </template>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  v-if="renamingId !== c.id"
                  class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                  :title="t('community.favorites.rename')"
                  @click="startRename(c)"
                >
                  ✏️
                </button>
                <button
                  v-else
                  class="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 rounded-lg"
                  @click="commitRename"
                >
                  ✓
                </button>
                <button
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors"
                  :class="deletingId === c.id ? 'bg-rose-500 text-white' : 'hover:bg-rose-50 text-slate-400'"
                  :title="deletingId === c.id ? t('community.favorites.confirmDelete') : t('community.favorites.delete')"
                  @click="onDelete(c)"
                >
                  {{ deletingId === c.id ? '✓?' : '🗑' }}
                </button>
              </div>
            </div>
            <p v-if="community.favoriteCollections.length === 0" class="text-center text-xs text-slate-400 py-4">
              {{ t('community.favorites.noFolders') }}
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
