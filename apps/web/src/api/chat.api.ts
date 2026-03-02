import type { ChatMessage } from '@devhub/shared';
import { useAuthStore } from '../stores/authStore';
import { api } from './client';

export async function* streamChat(messages: ChatMessage[], conversationId?: string) {
  const token = useAuthStore.getState().accessToken;

  const response = await fetch('/api/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ messages, conversationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to get response');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.text) yield parsed.text;
      } catch (e: any) {
        if (e.message && e.message !== 'Unexpected end of JSON input') {
          throw e;
        }
      }
    }
  }
}

export const conversationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/conversations', { params }),
  get: (conversationId: string) =>
    api.get(`/conversations/${conversationId}`),
  delete: (conversationId: string) =>
    api.delete(`/conversations/${conversationId}`),
};
