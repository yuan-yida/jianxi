// 社区 API 封装（帖子 / 点赞 / 收藏 / 关注），自动携带登录 token
import type {
  Post,
  PostType,
  PostCard,
  PostComment,
  SavedPostRecord,
  SavedTopicRecord,
  FavoriteCollection,
} from '@/data/community';

export class CommunityApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(message: string, status: number, data: Record<string, unknown>) {
    super(message);
    this.name = 'CommunityApiError';
    this.status = status;
    this.data = data;
  }
}

const TOKEN_KEY = 'verbflow_auth_token';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new CommunityApiError(String(data.error || 'REQUEST_FAILED'), res.status, data);
  }
  return data as T;
}

export interface CreatePostPayload {
  type: PostType;
  content: string;
  topic: string;
  tags: string[];
  card?: PostCard;
}

export interface MeCommunityData {
  likedPostIds: string[];
  savedPostIds: string[];
  savedRecords: SavedPostRecord[];
  savedTopicRecords: SavedTopicRecord[];
  favoriteCollections: FavoriteCollection[];
  followingIds: string[];
  myPostIds: string[];
}

export const communityApi = {
  getPosts(): Promise<{ posts: Post[] }> {
    return request('/api/community/posts');
  },

  createPost(payload: CreatePostPayload): Promise<{ post: Post }> {
    return request('/api/community/posts', { method: 'POST', body: JSON.stringify(payload) });
  },

  deletePost(id: string): Promise<{ ok: boolean }> {
    return request(`/api/community/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  toggleLike(id: string): Promise<{ liked: boolean; likes: number }> {
    return request(`/api/community/posts/${encodeURIComponent(id)}/like`, { method: 'POST' });
  },

  addComment(id: string, content: string, parentId?: string): Promise<{ comment: PostComment }> {
    return request(`/api/community/posts/${encodeURIComponent(id)}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  },

  savePost(id: string, collectionIds: string[], saved: boolean): Promise<{ saved: boolean; saves: number }> {
    return request(`/api/community/posts/${encodeURIComponent(id)}/save`, {
      method: 'POST',
      body: JSON.stringify({ saved, collectionIds }),
    });
  },

  saveTopic(topicId: string, collectionIds: string[], saved: boolean): Promise<{ ok: boolean; saved: boolean }> {
    return request(`/api/community/topics/${encodeURIComponent(topicId)}/save`, {
      method: 'POST',
      body: JSON.stringify({ saved, collectionIds }),
    });
  },

  setCollections(favoriteCollections: FavoriteCollection[]): Promise<{ ok: boolean }> {
    return request('/api/community/me/collections', {
      method: 'PUT',
      body: JSON.stringify({ favoriteCollections }),
    });
  },

  setFollows(followingIds: string[]): Promise<{ ok: boolean }> {
    return request('/api/community/me/follows', {
      method: 'PUT',
      body: JSON.stringify({ followingIds }),
    });
  },

  getMeData(): Promise<MeCommunityData> {
    return request('/api/community/me/data');
  },
};
