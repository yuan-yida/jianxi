import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { router } from '@/router';
import { useUserStore } from './user';
import { communityApi, type CreatePostPayload } from '@/api/community';
import {
  SEED_POSTS,
  SEED_TOPICS,
  SEED_LEADERBOARD,
  SEED_TEAMS,
  SEED_NOTIFICATIONS,
  SEED_FOLLOWING,
  SEED_FAVORITE_COLLECTIONS,
  SEED_SAVED_RECORDS,
  SEED_SAVED_TOPIC_RECORDS,
  getUserById,
  type Post,
  type PostComment,
  type PostType,
  type CommunityTopic,
  type LeaderboardEntry,
  type Team,
  type Notification,
  type CommunityUser,
  type FavoriteCollection,
  type SavedPostRecord,
  type SavedPostView,
  type SavedTopicRecord,
  type SavedTopicView,
  type SavedItemView,
} from '@/data/community';

const GUEST_STORAGE_KEY = 'verbflow_community_guest_v3';

interface GuestState {
  subscribedTopicIds: string[];
  joinedTeamIds: string[];
}

function loadGuestState(): GuestState {
  const defaults: GuestState = { subscribedTopicIds: [], joinedTeamIds: [] };
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<GuestState>;
    return {
      subscribedTopicIds: Array.isArray(parsed.subscribedTopicIds) ? parsed.subscribedTopicIds : defaults.subscribedTopicIds,
      joinedTeamIds: Array.isArray(parsed.joinedTeamIds) ? parsed.joinedTeamIds : defaults.joinedTeamIds,
    };
  } catch {
    return defaults;
  }
}

const timeAgo = (): string => 'just now';

const DEFAULT_CURRENT_USER: CommunityUser = {
  id: 'u_me',
  name: 'Learner',
  avatar: '🙋',
  avatarBg: 'from-indigo-400 to-purple-500',
  bio: '正在努力学英语的你',
  level: 3,
  levelTitle: '勤学之星',
  xp: 2180,
  streak: 6,
  followers: 12,
  following: 0,
};

export const useCommunityStore = defineStore('community', () => {
  const userStore = useUserStore();

  const guestState = loadGuestState();

  // ===== 帖子（公共数据，来自服务端） =====
  const serverPosts = ref<Post[]>([]);
  const postsLoading = ref(false);

  // ===== 账号相关的互动状态 =====
  const likedPostIds = ref<string[]>([]);
  const savedRecords = ref<SavedPostRecord[]>([...SEED_SAVED_RECORDS]);
  const savedTopicRecords = ref<SavedTopicRecord[]>([...SEED_SAVED_TOPIC_RECORDS]);
  const favoriteCollections = ref<FavoriteCollection[]>([...SEED_FAVORITE_COLLECTIONS]);
  const followingIds = ref<string[]>([...SEED_FOLLOWING]);
  const subscribedTopicIds = ref<string[]>(guestState.subscribedTopicIds);
  const joinedTeamIds = ref<string[]>(guestState.joinedTeamIds);

  const isAccountMode = ref(false);

  // ===== 当前用户（登录后为账号，游客为演示用户） =====
  const currentUser = computed<CommunityUser>(() => {
    const u = userStore.authUser;
    if (u) {
      return {
        id: u.id,
        name: u.name,
        avatar: u.name.charAt(0).toUpperCase(),
        avatarBg: 'from-indigo-400 to-purple-500',
        avatarColor: u.avatarColor,
        bio: '',
        level: 1,
        levelTitle: '英语学习者',
        xp: 0,
        streak: 0,
        followers: 0,
        following: followingIds.value.length,
        isAccount: true,
      };
    }
    return { ...DEFAULT_CURRENT_USER, following: followingIds.value.length };
  });

  const posts = computed<Post[]>(() => serverPosts.value);

  const sortedPosts = (mode: 'recommend' | 'latest' | 'hot' | 'following') => {
    const list = [...posts.value];
    if (mode === 'following') {
      return list.filter((p) => followingIds.value.includes(p.author.id));
    }
    if (mode === 'latest') {
      return list.sort((a, b) => b.createdAt - a.createdAt);
    }
    if (mode === 'hot') {
      return list.sort((a, b) => b.views + b.likes * 3 - (a.views + a.likes * 3));
    }
    // recommend：置顶优先，其次按热度+新鲜度加权
    return [...list.filter((p) => p.isTop), ...list.filter((p) => !p.isTop)]
      .sort((a, b) => (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0) || (b.likes * 2 + b.comments.length * 3 + b.views / 100 + b.createdAt / 1e10) - (a.likes * 2 + a.comments.length * 3 + a.views / 100 + a.createdAt / 1e10));
  };

  const getPost = (id: string) => posts.value.find((p) => p.id === id);

  function persistGuest() {
    try {
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify({
          subscribedTopicIds: subscribedTopicIds.value,
          joinedTeamIds: joinedTeamIds.value,
        }),
      );
    } catch {
      // localStorage 不可用时静默失败
    }
  }

  // ===== 登录引导 =====
  function requireLogin(): boolean {
    if (userStore.isLoggedIn) return true;
    const current = router.currentRoute.value.fullPath;
    router.push({ path: '/auth', query: { redirect: current } });
    return false;
  }

  // ===== 帖子拉取与状态合并 =====
  function applyViewerState(postsList: Post[]) {
    const savedSet = new Set(savedRecords.value.map((r) => r.postId));
    const likedSet = new Set(likedPostIds.value);
    postsList.forEach((p) => {
      p.liked = likedSet.has(p.id);
      p.saved = savedSet.has(p.id);
    });
  }

  async function loadPosts() {
    if (postsLoading.value) return;
    postsLoading.value = true;
    try {
      const { posts: list } = await communityApi.getPosts();
      serverPosts.value = list;
      applyViewerState(list);
    } catch {
      // 网络异常时保留当前列表
    } finally {
      postsLoading.value = false;
    }
  }

  async function syncAccount() {
    try {
      const data = await communityApi.getMeData();
      likedPostIds.value = data.likedPostIds;
      savedRecords.value = data.savedRecords;
      savedTopicRecords.value = data.savedTopicRecords;
      favoriteCollections.value = data.favoriteCollections;
      followingIds.value = data.followingIds;
      isAccountMode.value = true;
      await loadPosts();
    } catch {
      // 拉取失败不阻塞页面
    }
  }

  function resetToGuest() {
    likedPostIds.value = [];
    savedRecords.value = [...SEED_SAVED_RECORDS];
    savedTopicRecords.value = [...SEED_SAVED_TOPIC_RECORDS];
    favoriteCollections.value = [...SEED_FAVORITE_COLLECTIONS];
    followingIds.value = [...SEED_FOLLOWING];
    isAccountMode.value = false;
    loadPosts();
  }

  // 登录 / 退出联动
  watch(
    () => userStore.token,
    (token) => {
      if (token) void syncAccount();
      else resetToGuest();
    },
    { immediate: true },
  );

  // ===== 点赞 =====
  async function toggleLike(postId: string) {
    const post = getPost(postId);
    if (!post) return;
    if (!requireLogin()) return;
    const prev = { liked: post.liked, likes: post.likes };
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    try {
      const r = await communityApi.toggleLike(postId);
      post.liked = r.liked;
      post.likes = r.likes;
    } catch {
      post.liked = prev.liked;
      post.likes = prev.likes;
    }
  }

  // ===== 收藏（支持收藏夹，按账号同步） =====
  function isSaved(postId: string): boolean {
    return savedRecords.value.some((r) => r.postId === postId);
  }

  function getSavedRecord(postId: string): SavedPostRecord | undefined {
    return savedRecords.value.find((r) => r.postId === postId);
  }

  async function savePost(postId: string, collectionIds: string[]) {
    const post = getPost(postId);
    if (!post) return;
    if (!requireLogin()) return;
    const existed = getSavedRecord(postId);
    const prevSaved = Boolean(existed);
    if (existed) {
      existed.collectionIds = [...new Set(collectionIds)];
      existed.savedAt = Date.now();
    } else {
      savedRecords.value.push({ postId, collectionIds: [...new Set(collectionIds)], savedAt: Date.now() });
      post.saved = true;
      post.saves += 1;
    }
    try {
      const r = await communityApi.savePost(postId, collectionIds, true);
      post.saves = r.saves;
    } catch {
      if (!prevSaved) {
        savedRecords.value = savedRecords.value.filter((r) => r.postId !== postId);
        post.saved = false;
        post.saves = Math.max(0, post.saves - 1);
      }
    }
  }

  async function unsavePost(postId: string) {
    const post = getPost(postId);
    if (!post) return;
    if (!requireLogin()) return;
    const prevRecord = getSavedRecord(postId);
    const prevSaved = Boolean(prevRecord);
    const prevCollectionIds = prevRecord ? [...prevRecord.collectionIds] : [];
    savedRecords.value = savedRecords.value.filter((r) => r.postId !== postId);
    post.saved = false;
    post.saves = Math.max(0, post.saves - 1);
    try {
      const r = await communityApi.savePost(postId, [], false);
      post.saves = r.saves;
    } catch {
      if (prevSaved) {
        savedRecords.value.push({ postId, collectionIds: prevCollectionIds, savedAt: Date.now() });
        post.saved = true;
        post.saves += 1;
      }
    }
  }

  async function toggleSave(postId: string) {
    if (isSaved(postId)) {
      await unsavePost(postId);
    } else {
      await savePost(postId, []);
    }
  }

  // ===== 收藏夹 =====
  async function createCollection(input: { name: string; icon: string; color: string }) {
    if (!requireLogin()) return undefined;
    const collection: FavoriteCollection = {
      id: `fc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      icon: input.icon || '📁',
      color: input.color || '#6366f1',
      createdAt: Date.now(),
    };
    if (!collection.name) return undefined;
    favoriteCollections.value.push(collection);
    void syncCollections();
    return collection;
  }

  async function renameCollection(collectionId: string, name: string) {
    const collection = favoriteCollections.value.find((c) => c.id === collectionId);
    if (!collection || !name.trim()) return;
    collection.name = name.trim();
    void syncCollections();
  }

  async function deleteCollection(collectionId: string) {
    favoriteCollections.value = favoriteCollections.value.filter((c) => c.id !== collectionId);
    savedRecords.value.forEach((r) => {
      r.collectionIds = r.collectionIds.filter((id) => id !== collectionId);
    });
    savedTopicRecords.value.forEach((r) => {
      r.collectionIds = r.collectionIds.filter((id) => id !== collectionId);
    });
    void syncCollections();
  }

  function syncCollections() {
    if (!isAccountMode.value) return Promise.resolve();
    return communityApi.setCollections(favoriteCollections.value).catch(() => undefined);
  }

  // ===== 话题收藏 =====
  function isTopicSaved(topicId: string): boolean {
    return savedTopicRecords.value.some((r) => r.topicId === topicId);
  }

  function getTopicSavedRecord(topicId: string): SavedTopicRecord | undefined {
    return savedTopicRecords.value.find((r) => r.topicId === topicId);
  }

  async function saveTopic(topicId: string, collectionIds: string[]) {
    if (!requireLogin()) return;
    const existed = getTopicSavedRecord(topicId);
    if (existed) {
      existed.collectionIds = [...new Set(collectionIds)];
      existed.savedAt = Date.now();
    } else {
      savedTopicRecords.value.push({ topicId, collectionIds: [...new Set(collectionIds)], savedAt: Date.now() });
    }
    try {
      await communityApi.saveTopic(topicId, collectionIds, true);
    } catch {
      if (!existed) {
        savedTopicRecords.value = savedTopicRecords.value.filter((r) => r.topicId !== topicId);
      }
    }
  }

  async function unsaveTopic(topicId: string) {
    if (!requireLogin()) return;
    const prevSaved = Boolean(getTopicSavedRecord(topicId));
    savedTopicRecords.value = savedTopicRecords.value.filter((r) => r.topicId !== topicId);
    try {
      await communityApi.saveTopic(topicId, [], false);
    } catch {
      if (prevSaved) {
        savedTopicRecords.value.push({ topicId, collectionIds: [], savedAt: Date.now() });
      }
    }
  }

  async function toggleSaveTopic(topicId: string) {
    if (isTopicSaved(topicId)) {
      await unsaveTopic(topicId);
    } else {
      await saveTopic(topicId, []);
    }
  }

  function getCollection(collectionId: string): FavoriteCollection | undefined {
    return favoriteCollections.value.find((c) => c.id === collectionId);
  }

  // ===== 评论（绑定账号） =====
  async function addComment(postId: string, content: string, parentId?: string) {
    const post = getPost(postId);
    if (!post || !content.trim()) return;
    if (!requireLogin()) return;
    try {
      const { comment } = await communityApi.addComment(postId, content, parentId);
      if (parentId) {
        const parent = post.comments.find((c) => c.id === parentId);
        if (parent) parent.replies.unshift(comment);
      } else {
        post.comments.unshift(comment);
      }
    } catch {
      // 失败静默
    }
  }

  // ===== 发布帖子（绑定账号） =====
  async function addPost(input: CreatePostPayload) {
    const content = input.content.trim();
    if (!content) return undefined;
    if (!requireLogin()) return undefined;
    const topic = SEED_TOPICS.find((t) => t.name === input.topic) || SEED_TOPICS[0];
    try {
      const { post } = await communityApi.createPost({ ...input, content, topic: topic.name });
      serverPosts.value.unshift(post);
      return post;
    } catch {
      return undefined;
    }
  }

  async function removePost(postId: string): Promise<boolean> {
    const post = getPost(postId);
    if (!post) return false;
    if (!requireLogin()) return false;
    try {
      await communityApi.deletePost(postId);
      serverPosts.value = serverPosts.value.filter((p) => p.id !== postId);
      return true;
    } catch {
      return false;
    }
  }

  // ===== 关注（按账号同步） =====
  const followingUsers = computed<CommunityUser[]>(() =>
    followingIds.value.map(getUserById).filter(Boolean),
  );

  function isFollowing(userId: string) {
    return followingIds.value.includes(userId);
  }

  async function toggleFollow(userId: string) {
    if (!requireLogin()) return;
    const user = getUserById(userId);
    if (isFollowing(userId)) {
      followingIds.value = followingIds.value.filter((id) => id !== userId);
      user.followers = Math.max(0, user.followers - 1);
    } else {
      followingIds.value.push(userId);
      user.followers += 1;
    }
    try {
      await communityApi.setFollows(followingIds.value);
    } catch {
      // 失败时回滚
      if (isFollowing(userId)) {
        followingIds.value = followingIds.value.filter((id) => id !== userId);
        user.followers = Math.max(0, user.followers - 1);
      } else {
        followingIds.value.push(userId);
        user.followers += 1;
      }
    }
  }

  // ===== 话题订阅（本地） =====
  const topics = computed<CommunityTopic[]>(() =>
    SEED_TOPICS.map((t) => ({ ...t, subscribed: subscribedTopicIds.value.includes(t.id) })),
  );

  function toggleSubscribeTopic(topicId: string) {
    if (!requireLogin()) return;
    if (subscribedTopicIds.value.includes(topicId)) {
      subscribedTopicIds.value = subscribedTopicIds.value.filter((id) => id !== topicId);
    } else {
      subscribedTopicIds.value.push(topicId);
    }
    persistGuest();
  }

  // ===== 排行榜 =====
  const leaderboard = computed<LeaderboardEntry[]>(() =>
    SEED_LEADERBOARD.map((entry, idx) => ({ ...entry, rank: idx + 1 })),
  );

  const currentRank = computed(() => {
    const myXp = currentUser.value.xp;
    const higher = SEED_LEADERBOARD.filter((e) => e.xp > myXp).length;
    return higher + 1;
  });

  // ===== 学习小队 =====
  const teams = computed<Team[]>(() =>
    SEED_TEAMS.map((t) => ({ ...t, joined: joinedTeamIds.value.includes(t.id) })),
  );

  function joinTeam(teamId: string) {
    if (!requireLogin()) return;
    if (joinedTeamIds.value.includes(teamId)) return;
    joinedTeamIds.value.push(teamId);
    const team = SEED_TEAMS.find((t) => t.id === teamId);
    if (team) team.members += 1;
    persistGuest();
  }

  // ===== 消息 =====
  const notifications = ref<Notification[]>(SEED_NOTIFICATIONS);

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length);

  function markNotificationRead(id: string) {
    const n = notifications.value.find((i) => i.id === id);
    if (n) n.read = true;
  }

  function markAllRead() {
    notifications.value.forEach((n) => (n.read = true));
  }

  // ===== 收藏列表（供收藏页使用，按收藏时间倒序） =====
  const savedPostViews = computed<SavedPostView[]>(() =>
    savedRecords.value
      .map((r) => {
        const post = getPost(r.postId);
        if (!post) return undefined;
        post.saved = true; // 同步卡片收藏状态
        return { post, savedAt: r.savedAt, collectionIds: r.collectionIds };
      })
      .filter((v): v is SavedPostView => Boolean(v))
      .sort((a, b) => b.savedAt - a.savedAt),
  );

  const savedPostsOfCollection = (collectionId: string | undefined): SavedPostView[] => {
    if (!collectionId) return savedPostViews.value;
    return savedPostViews.value.filter((v) => v.collectionIds.includes(collectionId));
  };

  const savedTopicViews = computed<SavedTopicView[]>(() =>
    savedTopicRecords.value
      .map((r) => {
        const topic = SEED_TOPICS.find((tp) => tp.id === r.topicId);
        if (!topic) return undefined;
        return { topic, savedAt: r.savedAt, collectionIds: r.collectionIds };
      })
      .filter((v): v is SavedTopicView => Boolean(v))
      .sort((a, b) => b.savedAt - a.savedAt),
  );

  const savedTopicsOfCollection = (collectionId: string | undefined): SavedTopicView[] => {
    if (!collectionId) return savedTopicViews.value;
    return savedTopicViews.value.filter((v) => v.collectionIds.includes(collectionId));
  };

  const savedItems = computed<SavedItemView[]>(() =>
    [
      ...savedPostViews.value.map((v) => ({ kind: 'post' as const, post: v.post, savedAt: v.savedAt, collectionIds: v.collectionIds })),
      ...savedTopicViews.value.map((v) => ({ kind: 'topic' as const, topic: v.topic, savedAt: v.savedAt, collectionIds: v.collectionIds })),
    ].sort((a, b) => b.savedAt - a.savedAt),
  );

  const savedItemsOfCollection = (collectionId: string | undefined): SavedItemView[] => {
    if (!collectionId) return savedItems.value;
    return savedItems.value.filter((v) => v.collectionIds.includes(collectionId));
  };

  const myPosts = computed<Post[]>(() => serverPosts.value.filter((p) => p.author.id === currentUser.value.id));

  return {
    currentUser,
    postsLoading,
    posts,
    sortedPosts,
    getPost,
    toggleLike,
    isSaved,
    getSavedRecord,
    savePost,
    unsavePost,
    toggleSave,
    favoriteCollections,
    createCollection,
    renameCollection,
    deleteCollection,
    getCollection,
    addComment,
    addPost,
    removePost,
    followingIds,
    followingUsers,
    isFollowing,
    toggleFollow,
    topics,
    toggleSubscribeTopic,
    leaderboard,
    currentRank,
    teams,
    joinTeam,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    savedPostViews,
    savedPostsOfCollection,
    savedTopicViews,
    savedTopicsOfCollection,
    savedItems,
    savedItemsOfCollection,
    isTopicSaved,
    getTopicSavedRecord,
    saveTopic,
    unsaveTopic,
    toggleSaveTopic,
    myPosts,
  };
});
