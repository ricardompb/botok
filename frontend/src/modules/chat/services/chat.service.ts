import { handleUnauthorized } from '../../../shared/api/http-client';
import { getAccessToken } from '../../../shared/auth/access-token';
import type { SendMessageDto } from '../dto/chat.dto';

const API = import.meta.env.VITE_API_URL;

export interface ReplyHandlers {
  onSession: (sessionId: string) => void;
  onDelta: (text: string) => void;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Lê os eventos SSE (`event:` + `data:`) de uma resposta em streaming. */
async function* readEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    let end;
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const frame = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const event = /^event: (.*)$/m.exec(frame)?.[1];
      const data = /^data: (.*)$/m.exec(frame)?.[1];
      if (event) yield { event, data: data ? JSON.parse(data) : {} };
    }
  }
}

export const chatService = {
  /** Envia a mensagem e recebe a resposta do agente do Foundry aos poucos. */
  async send(dto: SendMessageDto, handlers: ReplyHandlers, signal: AbortSignal) {
    const res = await fetch(`${API}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(dto),
      signal,
    });
    if (!res.ok || !res.body) {
      handleUnauthorized(res.status);
      const data = await res.json().catch(() => null);
      throw new Error(data?.message ?? 'Não foi possível enviar a mensagem. Tente novamente.');
    }
    for await (const { event, data } of readEvents(res.body)) {
      if (event === 'session') handlers.onSession(data.sessionId);
      else if (event === 'delta') handlers.onDelta(data.text);
      else if (event === 'error') throw new Error(data.message);
      else if (event === 'done') return;
    }
    throw new Error('A resposta foi interrompida. Tente novamente.');
  },

  /** Encerra a sessão: o servidor apaga a conversa no Foundry. Sobrevive ao fechamento da página. */
  async end(sessionId: string) {
    await fetch(`${API}/chat/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: await authHeaders(),
      keepalive: true,
    }).catch(() => undefined);
  },
};
