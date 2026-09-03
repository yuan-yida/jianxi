import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
  },
  {
    path: '/scenes',
    name: 'scenes',
    component: () => import('@/views/SceneSelect.vue'),
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/ChatRoom.vue'),
  },
  {
    path: '/chat/:sceneId',
    name: 'chat-scene',
    component: () => import('@/views/ChatRoom.vue'),
    props: true,
  },
  {
    path: '/course/:sceneId',
    name: 'course-detail',
    component: () => import('@/views/CourseDetail.vue'),
    props: true,
  },
  {
    path: '/assessment/:sessionId',
    name: 'assessment',
    component: () => import('@/views/Assessment.vue'),
    props: true,
  },
  {
    path: '/assessment',
    name: 'assessment-default',
    component: () => import('@/views/Assessment.vue'),
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/History.vue'),
  },
  {
    path: '/placement-test',
    name: 'placement-test',
    component: () => import('@/views/PlacementTest.vue'),
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/Auth.vue'),
  },
  {
    path: '/learning-plan',
    name: 'learning-plan',
    component: () => import('@/views/LearningPlan.vue'),
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('@/views/Community.vue'),
    children: [
      { path: '', name: 'community-feed', component: () => import('@/views/community/Feed.vue') },
      { path: 'explore', name: 'community-explore', component: () => import('@/views/community/Explore.vue') },
      { path: 'post/:id', name: 'community-post', component: () => import('@/views/community/PostDetail.vue'), props: true },
      { path: 'create', name: 'community-create', component: () => import('@/views/community/CreatePost.vue') },
      { path: 'leaderboard', name: 'community-leaderboard', component: () => import('@/views/community/Leaderboard.vue') },
      { path: 'teams', name: 'community-teams', component: () => import('@/views/community/Teams.vue') },
      { path: 'favorites', name: 'community-favorites', component: () => import('@/views/community/MyFavorites.vue') },
      { path: 'articles', name: 'community-articles', component: () => import('@/views/community/MyArticles.vue') },
      { path: 'following', name: 'community-following', component: () => import('@/views/community/MyFollowing.vue') },
      { path: 'messages', name: 'community-messages', component: () => import('@/views/community/Messages.vue') },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
