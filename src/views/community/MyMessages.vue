<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@/i18n';

const { t } = useI18n();

interface Message {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'reply' | 'system';
  from: string;
  avatar: string;
  content: string;
  time: string;
  isRead: boolean;
}

const messages = ref<Message[]>([
  { id: 1, type: 'like', from: '李老师英语', avatar: '👩🏫', content: '赞了你的文章「我的英语学习之旅」', time: '5分钟前', isRead: false },
  { id: 2, type: 'comment', from: 'David Chen', avatar: '👨‍🎓', content: '评论了你的动态：「这个方法太实用了，感谢分享！」', time: '30分钟前', isRead: false },
  { id: 3, type: 'follow', from: 'Emily Wang', avatar: '👩‍', content: '关注了你', time: '1小时前', isRead: false },
  { id: 4, type: 'reply', from: 'Sarah Johnson', avatar: '👩‍💼', content: '回复了你的评论：「Great point! I totally agree with you.」', time: '2小时前', isRead: true },
  { id: 5, type: 'like', from: 'Mike Liu', avatar: '👨‍💻', content: '赞了你的评论', time: '3小时前', isRead: true },
  { id: 6, type: 'system', from: 'VerbFlow', avatar: '🔔', content: '你的文章「推荐5个免费的英语听力练习网站」已超过1000次浏览！', time: '昨天', isRead: true },
  { id: 7, type: 'comment', from: 'Amy Zhang', avatar: '👩‍🎨', content: '评论了你的动态：「请问有什么适合初学者的听力材料推荐吗？」', time: '昨天', isRead: true },
]);

const activeFilter = ref('all');
const filters = [
  { key: 'all', label: 'community.messages.all', icon: '📬' },
  { key: 'like', label: 'community.messages.likes', icon: '❤️' },
  { key: 'comment', label: 'community.messages.comments', icon: '💬' },
  { key: 'follow', label: 'community.messages.follows', icon: '👤' },
  { key: 'system', label: 'community.messages.system', icon: '🔔' },
];

const filteredMessages = ref(messages.value);

const markAllRead = () => {
  messages.value.forEach(m => { m.isRead = true; });
};

const markRead = (id: number) => {
  const msg = messages.value.find(m => m.id === id);
  if (msg) msg.isRead = true;
};

const typeIcon: Record<string, string> = {
  like: '❤️', comment: '💬', follow: '', reply: '↩️', system: '🔔',
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-slate-800">{{ t('community.messages.title') }}</h2>
      <button
        @click="markAllRead"
        class="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
      >{{ t('community.messages.markAllRead') }}</button>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="filter in filters"
        :key="filter.key"
        @click="activeFilter = filter.key"
        :class="[
          'px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1',
          activeFilter === filter.key
            ? 'bg-indigo-500 text-white shadow-sm'
            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100',
        ]"
      >
        <span>{{ filter.icon }}</span>
        {{ t(filter.label) }}
      </button>
    </div>

    <div class="space-y-2">
      <div
        v-for="msg in messages"
        :key="msg.id"
        @click="markRead(msg.id)"
        :class="[
          'bg-white rounded-xl p-4 border transition-all cursor-pointer',
          msg.isRead ? 'border-slate-100' : 'border-indigo-100 bg-indigo-50/30',
        ]"
      >
        <div class="flex items-start gap-3">
          <div class="text-2xl relative">
            {{ msg.avatar }}
            <span
              v-if="!msg.isRead"
              class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-sm font-medium text-slate-700">{{ msg.from }}</span>
              <span class="text-xs text-slate-400">{{ msg.time }}</span>
            </div>
            <p class="text-sm text-slate-600">{{ msg.content }}</p>
          </div>
          <span class="text-lg">{{ typeIcon[msg.type] || '📩' }}</span>
        </div>
      </div>
    </div>

    <div v-if="messages.length === 0" class="py-16 text-center">
      <div class="text-5xl mb-3">📭</div>
      <p class="text-slate-400 text-sm">{{ t('community.messages.empty') }}</p>
    </div>
  </div>
</template>
