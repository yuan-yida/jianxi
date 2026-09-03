// 社区数据 JSON 文件存储（帖子 / 点赞 / 收藏 / 关注）
// 帖子为公共数据；点赞、收藏、关注按账号（userId）维度隔离
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  SEED_POSTS,
  SEED_TOPICS,
  type Post,
  type PostComment,
  type PostType,
  type PostCard,
  type CommunityUser,
  type SavedPostRecord,
  type SavedTopicRecord,
  type FavoriteCollection,
} from '../../src/data/community';
import type { UserRecord } from './store';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');
const SAVES_FILE = path.join(DATA_DIR, 'saves.json');
const FOLLOWS_FILE = path.join(DATA_DIR, 'follows.json');

export interface UserSavedData {
  savedRecords: SavedPostRecord[];
  savedTopicRecords: SavedTopicRecord[];
  favoriteCollections: FavoriteCollection[];
}

type LikesMap = Record<string, string[]>;
type FollowsMap = Record<string, string[]>;
type SavesMap = Record<string, UserSavedData>;

function ensureDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch (err) {
    console.error('[COMMUNITY-STORE] read failed:', file, err);
    return fallback;
  }
}

function writeJson(file: string, data: unknown): void {
  ensureDir();
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

// ===== 帖子 =====

function loadPosts(): Post[] {
  const posts = readJson<Post[]>(POSTS_FILE, []);
  // 首次启动导入种子帖子作为公共演示数据
  if (posts.length === 0 && SEED_POSTS.length > 0) {
    writeJson(POSTS_FILE, SEED_POSTS);
    return SEED_POSTS;
  }
  return posts;
}

function savePosts(posts: Post[]): void {
  writeJson(POSTS_FILE, posts);
}

export function getAllPosts(): Post[] {
  return loadPosts();
}

export function getPostById(id: string): Post | undefined {
  return loadPosts().find((p) => p.id === id);
}

export function createPost(author: CommunityUser, input: { type: PostType; content: string; topic: string; tags: string[]; card?: PostCard }): Post {
  const posts = loadPosts();
  const topic = SEED_TOPICS.find((tp) => tp.name === input.topic) || SEED_TOPICS[0];
  const post: Post = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: input.type,
    author,
    content: input.content.trim(),
    card: input.card,
    topic: topic.name,
    topicColor: topic.color,
    tags: input.tags.slice(0, 5),
    images: 0,
    likes: 0,
    comments: [],
    saves: 0,
    views: 1,
    shares: 0,
    time: 'just now',
    createdAt: Date.now(),
    liked: false,
    saved: false,
    isTop: false,
    isHot: false,
  };
  posts.unshift(post);
  savePosts(posts);
  return post;
}

export function deletePostById(id: string): boolean {
  const posts = loadPosts();
  const next = posts.filter((p) => p.id !== id);
  if (next.length === posts.length) return false;
  savePosts(next);
  return true;
}

// ===== 点赞 =====

function loadLikes(): LikesMap {
  return readJson<LikesMap>(LIKES_FILE, {});
}

function saveLikes(map: LikesMap): void {
  writeJson(LIKES_FILE, map);
}

export function getLikedPostIds(userId: string): string[] {
  return loadLikes()[userId] || [];
}

export function togglePostLike(userId: string, postId: string): { liked: boolean; likes: number } | undefined {
  const posts = loadPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return undefined;
  const map = loadLikes();
  const liked = map[userId] || [];
  const idx = liked.indexOf(postId);
  let likedNow: boolean;
  if (idx >= 0) {
    liked.splice(idx, 1);
    post.likes = Math.max(0, post.likes - 1);
    likedNow = false;
  } else {
    liked.push(postId);
    post.likes += 1;
    likedNow = true;
  }
  map[userId] = liked;
  saveLikes(map);
  savePosts(posts);
  return { liked: likedNow, likes: post.likes };
}

// ===== 收藏 =====

function loadSaves(): SavesMap {
  return readJson<SavesMap>(SAVES_FILE, {});
}

function saveSavesMap(map: SavesMap): void {
  writeJson(SAVES_FILE, map);
}

export function getUserSaved(userId: string): UserSavedData {
  const map = loadSaves();
  return (
    map[userId] || {
      savedRecords: [],
      savedTopicRecords: [],
      favoriteCollections: [],
    }
  );
}

export function getSavedPostIds(userId: string): string[] {
  return getUserSaved(userId).savedRecords.map((r) => r.postId);
}

/**
 * 收藏 / 取消收藏帖子。saved=true 时写入收藏记录并同步帖子收藏数。
 */
export function setPostSaved(userId: string, postId: string, collectionIds: string[], saved: boolean): { saved: boolean; saves: number } | undefined {
  const posts = loadPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return undefined;
  const map = loadSaves();
  const data = map[userId] || { savedRecords: [], savedTopicRecords: [], favoriteCollections: [] };
  const records = data.savedRecords;
  const existedIdx = records.findIndex((r) => r.postId === postId);

  if (saved) {
    if (existedIdx >= 0) {
      records[existedIdx].collectionIds = [...new Set(collectionIds)];
      records[existedIdx].savedAt = Date.now();
    } else {
      records.push({ postId, collectionIds: [...new Set(collectionIds)], savedAt: Date.now() });
      post.saves += 1;
    }
  } else if (existedIdx >= 0) {
    records.splice(existedIdx, 1);
    post.saves = Math.max(0, post.saves - 1);
  }

  map[userId] = data;
  saveSavesMap(map);
  savePosts(posts);
  return { saved: saved && existedIdx < 0 ? true : saved, saves: post.saves };
}

/** 收藏 / 取消收藏话题（不影响帖子计数）。 */
export function setTopicSaved(userId: string, topicId: string, collectionIds: string[], saved: boolean): boolean {
  const map = loadSaves();
  const data = map[userId] || { savedRecords: [], savedTopicRecords: [], favoriteCollections: [] };
  const records = data.savedTopicRecords;
  const existedIdx = records.findIndex((r) => r.topicId === topicId);

  if (saved) {
    if (existedIdx >= 0) {
      records[existedIdx].collectionIds = [...new Set(collectionIds)];
      records[existedIdx].savedAt = Date.now();
    } else {
      records.push({ topicId, collectionIds: [...new Set(collectionIds)], savedAt: Date.now() });
    }
  } else if (existedIdx >= 0) {
    records.splice(existedIdx, 1);
  }

  map[userId] = data;
  saveSavesMap(map);
  return saved;
}

export function setFavoriteCollections(userId: string, collections: FavoriteCollection[]): void {
  const map = loadSaves();
  const data = map[userId] || { savedRecords: [], savedTopicRecords: [], favoriteCollections: [] };
  data.favoriteCollections = collections.slice(0, 50);
  map[userId] = data;
  saveSavesMap(map);
}

// ===== 关注 =====

function loadFollows(): FollowsMap {
  return readJson<FollowsMap>(FOLLOWS_FILE, {});
}

function saveFollows(map: FollowsMap): void {
  writeJson(FOLLOWS_FILE, map);
}

export function getFollowingIds(userId: string): string[] {
  return loadFollows()[userId] || [];
}

export function setFollowingIds(userId: string, ids: string[]): void {
  const map = loadFollows();
  map[userId] = [...new Set(ids)];
  saveFollows(map);
}

// ===== 评论 =====

export function addCommentToPost(
  postId: string,
  author: CommunityUser,
  content: string,
  parentId?: string,
): PostComment | undefined {
  const posts = loadPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return undefined;
  const comment: PostComment = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    author,
    content: content.trim(),
    likes: 0,
    time: 'just now',
    createdAt: Date.now(),
    replies: [],
  };
  if (parentId) {
    const parent = post.comments.find((c) => c.id === parentId);
    if (parent) parent.replies.unshift(comment);
    else return undefined;
  } else {
    post.comments.unshift(comment);
  }
  savePosts(posts);
  return comment;
}

// ===== 辅助：账号用户 → 社区用户 =====

export function accountToCommunityUser(user: UserRecord): CommunityUser {
  return {
    id: user.id,
    name: user.name,
    avatar: user.name.charAt(0).toUpperCase(),
    avatarBg: 'from-indigo-400 to-purple-500',
    avatarColor: user.avatarColor,
    bio: '',
    level: 1,
    levelTitle: '英语学习者',
    xp: 0,
    streak: 0,
    followers: 0,
    following: 0,
    isAccount: true,
  };
}

export function genCollectionId(): string {
  return `fc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ===== 注销账户：清理该用户的点赞 / 收藏 / 关注数据 =====

export function cleanupUserCommunityData(userId: string): void {
  const likes = loadLikes();
  if (userId in likes) {
    delete likes[userId];
    saveLikes(likes);
  }
  const saves = loadSaves();
  if (userId in saves) {
    delete saves[userId];
    saveSavesMap(saves);
  }
  const follows = loadFollows();
  if (userId in follows) {
    delete follows[userId];
    saveFollows(follows);
  }
}
