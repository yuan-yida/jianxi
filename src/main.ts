import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { useUserStore } from './stores/user';
import './index.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount('#app');

// 恢复登录会话（异步，不影响首屏渲染）
useUserStore(pinia).initAuth();
