// 社区 API：帖子（绑定账号）、点赞、收藏/收藏夹、关注
import { Router, type Request, Response } from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  deletePostById,
  togglePostLike,
  getLikedPostIds,
  getUserSaved,
  getSavedPostIds,
  setPostSaved,
  setTopicSaved,
  setFavoriteCollections,
  getFollowingIds,
  setFollowingIds,
  addCommentToPost,
  accountToCommunityUser,
  genCollectionId,
  type UserSavedData,
} from '../lib/communityStore';
import { findUserById } from '../lib/store';
import { authRequired } from './auth';
import type { PostType, PostCard } from '../../src/data/community';

const router = Router();

function currentUserId(req: Request): string | undefined {
  return (req as Request & { userId?: string }).userId;
}

/**
 * GET /api/community/posts
 * 公共帖子列表（含种子演示帖与用户发布的帖子）
 */
router.get('/api/community/posts', (_req: Request, res: Response) => {
  res.json({ posts: getAllPosts() });
});

/**
 * POST /api/community/posts
 * 发布帖子（需登录，作者绑定账号）
 */
router.post('/api/community/posts', authRequired, (req: Request, res: Response) => {
  const userId = currentUserId(req);
  const user = userId ? findUserById(userId) : undefined;
  if (!user) {
    res.status(404).json({ error: 'USER_NOT_FOUND' });
    return;
  }
  const body = (req.body || {}) as Record<string, unknown>;
  const content = String(body.content || '').trim();
  if (!content) {
    res.status(400).json({ error: 'EMPTY_CONTENT' });
    return;
  }
  const type = (['post', 'question', 'checkin'].includes(String(body.type)) ? String(body.type) : 'post') as PostType;
  const topic = String(body.topic || '').slice(0, 20);
  const tags = Array.isArray(body.tags) ? body.tags.map((x) => String(x).trim()).filter(Boolean).slice(0, 5) : [];
  const card = body.card as PostCard | undefined;

  const post = createPost(accountToCommunityUser(user), { type, content, topic, tags, card });
  res.json({ post });
});

/**
 * DELETE /api/community/posts/:id
 * 删除自己的帖子
 */
router.delete('/api/community/posts/:id', authRequired, (req: Request, res: Response) => {
  const userId = currentUserId(req);
  const post = getPostById(String(req.params.id));
  if (!post) {
    res.status(404).json({ error: 'POST_NOT_FOUND' });
    return;
  }
  if (post.author.id !== userId) {
    res.status(403).json({ error: 'FORBIDDEN' });
    return;
  }
  deletePostById(post.id);
  res.json({ ok: true });
});

/**
 * POST /api/community/posts/:id/like
 * 点赞 / 取消点赞
 */
router.post('/api/community/posts/:id/like', authRequired, (req: Request, res: Response) => {
  const userId = currentUserId(req)!;
  const result = togglePostLike(userId, String(req.params.id));
  if (!result) {
    res.status(404).json({ error: 'POST_NOT_FOUND' });
    return;
  }
  res.json(result);
});

/**
 * POST /api/community/posts/:id/comment
 * 发表评论 / 回复（需登录，作者绑定账号）
 */
router.post('/api/community/posts/:id/comment', authRequired, (req: Request, res: Response) => {
  const userId = currentUserId(req);
  const user = userId ? findUserById(userId) : undefined;
  if (!user) {
    res.status(404).json({ error: 'USER_NOT_FOUND' });
    return;
  }
  const body = (req.body || {}) as Record<string, unknown>;
  const content = String(body.content || '').trim();
  if (!content) {
    res.status(400).json({ error: 'EMPTY_CONTENT' });
    return;
  }
  const parentId = typeof body.parentId === 'string' && body.parentId ? body.parentId : undefined;
  const comment = addCommentToPost(String(req.params.id), accountToCommunityUser(user), content, parentId);
  if (!comment) {
    res.status(404).json({ error: 'POST_NOT_FOUND' });
    return;
  }
  res.json({ comment });
});

/**
 * POST /api/community/posts/:id/save
 * 收藏 / 取消收藏帖子（body: { saved, collectionIds }）
 */
router.post('/api/community/posts/:id/save', authRequired, (req: Request, res: Response) => {
  const userId = currentUserId(req)!;
  const body = (req.body || {}) as Record<string, unknown>;
  const saved = body.saved !== false;
  const collectionIds = Array.isArray(body.collectionIds)
    ? body.collectionIds.map((x) => String(x)).filter(Boolean)
    : [];
  const result = setPostSaved(userId, String(req.params.id), collectionIds, saved);
  if (!result) {
    res.status(404).json({ error: 'POST_NOT_FOUND' });
    return;
  }
  res.json(result);
});

/**
 * POST /api/community/topics/:id/save
 * 收藏 / 取消收藏话题（body: { saved, collectionIds }）
 */
router.post('/api/community/topics/:id/save', authRequired, (req: Request, res: Response) => {
  const userId = currentUserId(req)!;
  const body = (req.body || {}) as Record<string, unknown>;
  const saved = body.saved !== false;
  const collectionIds = Array.isArray(body.collectionIds)
    ? body.collectionIds.map((x) => String(x)).filter(Boolean)
    : [];
  const ok = setTopicSaved(userId, String(req.params.id), collectionIds, saved);
  res.json({ ok, saved });
});

/**
 * PUT /api/community/me/collections
 * 覆盖当前账号的收藏夹列表
 */
router.put('/api/community/me/collections', authRequired, (req: Request, res: Response) => {
  const userId = currentUserId(req)!;
  const body = (req.body || {}) as Record<string, unknown>;
  const list = Array.isArray(body.favoriteCollections)
    ? body.favoriteCollections
        .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
        .map((c, idx) => ({
          id: String(c.id || genCollectionId()),
          name: String(c.name || '未命名').slice(0, 12),
          icon: String(c.icon || '📁'),
          color: String(c.color || '#6366f1'),
          createdAt: typeof c.createdAt === 'number' ? c.createdAt : Date.now() + idx,
        }))
    : [];
  setFavoriteCollections(userId, list);
  res.json({ ok: true });
});

/**
 * PUT /api/community/me/follows
 * 覆盖当前账号的关注列表
 */
router.put('/api/community/me/follows', authRequired, (req: Request, res: Response) => {
  const userId = currentUserId(req)!;
  const body = (req.body || {}) as Record<string, unknown>;
  const ids = Array.isArray(body.followingIds) ? body.followingIds.map((x) => String(x)) : [];
  setFollowingIds(userId, ids);
  res.json({ ok: true });
});

/**
 * GET /api/community/me/data
 * 当前账号的社区数据（点赞、收藏、关注、我的帖子）
 */
router.get('/api/community/me/data', authRequired, (req: Request, res: Response) => {
  const userId = currentUserId(req)!;
  const saved: UserSavedData = getUserSaved(userId);
  const all = getAllPosts();
  res.json({
    likedPostIds: getLikedPostIds(userId),
    savedPostIds: getSavedPostIds(userId),
    savedRecords: saved.savedRecords,
    savedTopicRecords: saved.savedTopicRecords,
    favoriteCollections: saved.favoriteCollections,
    followingIds: getFollowingIds(userId),
    myPostIds: all.filter((p) => p.author.id === userId).map((p) => p.id),
  });
});

export default router;
