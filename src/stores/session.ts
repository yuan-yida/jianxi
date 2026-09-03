import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatMessage } from './chat';

/**
 * 会话报告快照。
 * 对话结束后由 ChatRoom 保存快照，供 Assessment 报告页读取展示，
 * 避免路由离开时 chatStore.reset() 清空数据导致报告丢失。
 */
export interface SessionReport {
  sessionId: string;
  sceneId: string;
  sceneTitle: string;
  sceneTitleZh: string;
  durationMinutes: number;
  messages: ChatMessage[];
  savedAt: number;
}

export const useSessionStore = defineStore('session', () => {
  const report = ref<SessionReport | null>(null);

  function saveReport(data: SessionReport) {
    report.value = data;
  }

  function clear() {
    report.value = null;
  }

  return { report, saveReport, clear };
});
