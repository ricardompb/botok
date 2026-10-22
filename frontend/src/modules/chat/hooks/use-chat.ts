import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../dto/chat.dto';
import { chatService } from '../services/chat.service';

type SendResult = { ok: true } | { ok: false; error: string; restoreDraft: boolean };

const updateLast = (t: ChatMessage[], fn: (m: ChatMessage) => ChatMessage) => [...t.slice(0, -1), fn(t[t.length - 1])];

/**
 * Conversa temporária com o agente do Foundry. O histórico vive só na
 * memória deste componente; ao desmontar (encerrar, trocar de assistente,
 * sair da tela) ou fechar a página, a sessão é encerrada no servidor, que
 * apaga a conversa no Foundry.
 */
export function useChat(agentId: string) {
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const sessionId = useRef<string | undefined>(undefined);
  const inFlight = useRef<AbortController | null>(null);

  const send = useCallback(
    async (message: string): Promise<SendResult> => {
      setSending(true);
      setTranscript((t) => [...t, { role: 'user', text: message }, { role: 'bot', text: '', pending: true }]);
      const abort = new AbortController();
      inFlight.current = abort;
      let received = false;
      try {
        await chatService.send(
          { agentId, sessionId: sessionId.current, message },
          {
            onSession: (id) => (sessionId.current = id),
            onDelta: (text) => {
              received = true;
              setTranscript((t) => updateLast(t, (m) => ({ ...m, text: m.text + text })));
            },
          },
          abort.signal,
        );
        setTranscript((t) => updateLast(t, (m) => ({ ...m, pending: false })));
        return { ok: true };
      } catch (err) {
        if (abort.signal.aborted) return { ok: true };
        // Sem resposta: desfaz o turno para o usuário tentar de novo; com resposta parcial, mantém o texto.
        setTranscript((t) => (received ? updateLast(t, (m) => ({ ...m, pending: false })) : t.slice(0, -2)));
        return { ok: false, error: (err as Error).message, restoreDraft: !received };
      } finally {
        inFlight.current = null;
        setSending(false);
      }
    },
    [agentId],
  );

  useEffect(() => {
    const end = () => {
      inFlight.current?.abort();
      if (sessionId.current) void chatService.end(sessionId.current);
      sessionId.current = undefined;
    };
    window.addEventListener('pagehide', end);
    return () => {
      window.removeEventListener('pagehide', end);
      end();
    };
  }, []);

  return { transcript, sending, send };
}
