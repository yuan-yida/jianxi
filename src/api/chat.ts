// 前端 Chat / TTS / ASR API 封装
import { ApiError } from './auth';

export interface ChatPayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Evaluation {
  pronunciationScore: number;
  grammarScore: number;
  fluencyScore: number;
  feedback: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
}

export interface EvaluateResult {
  evaluation: Evaluation;
}

export interface TTSResult {
  audioUri: string;
  audioSize: number;
}

export interface ASRResult {
  text: string;
  duration?: number;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(String(data.error || 'REQUEST_FAILED'), res.status, data);
  }
  return data as T;
}

/**
 * SSE 流式对话：逐段回调增量文本，收到 [DONE] 或流结束后 resolve。
 * 后端错误（HTTP 4xx/5xx 或流内 data:{error}）会以异常抛出。
 */
export async function streamChat(
  messages: ChatPayload[],
  sceneId?: string,
  opts?: { onDelta?: (delta: string) => void; signal?: AbortSignal },
): Promise<void> {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, sceneId }),
    signal: opts?.signal,
  });

  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new ApiError(String(data.error || 'STREAM_FAILED'), res.status, data);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIdx: number;
    while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + 2);
      for (const line of chunk.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data) as { content?: string; error?: string };
          if (parsed.error) throw new Error(parsed.error);
          if (typeof parsed.content === 'string' && parsed.content.length > 0) {
            opts?.onDelta?.(parsed.content);
          }
        } catch (err) {
          if (err instanceof SyntaxError) continue; // 忽略非 JSON 的注释行
          throw err;
        }
      }
    }
  }
}

/** 对单条英文消息进行即时评估（发音/语法/流利度） */
export function evaluateMessage(userMessage: string, sceneContext?: string): Promise<EvaluateResult> {
  return request<EvaluateResult>('/api/chat/evaluate', {
    method: 'POST',
    body: JSON.stringify({ userMessage, sceneContext }),
  });
}

/** 文本转语音，返回音频 URI */
export function synthesizeSpeech(text: string, speaker?: string): Promise<TTSResult> {
  return request<TTSResult>('/api/tts/synthesize', {
    method: 'POST',
    body: JSON.stringify({ text, speaker }),
  });
}

/** 语音识别：传入 base64 音频，返回识别文本 */
export function recognizeSpeech(audioData: string): Promise<ASRResult> {
  return request<ASRResult>('/api/asr/recognize', {
    method: 'POST',
    body: JSON.stringify({ audioData }),
  });
}
