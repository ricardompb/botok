import { useCallback, useRef, useState } from 'react';
import { apiErrorMessage } from '../../../shared/api/api-error';
import type { ChatMessage } from '../dto/chat.dto';
import { chatService } from '../services/chat.service';

/**
 * Conversa temporária: o histórico vive apenas na memória deste componente
 * e é descartado ao encerrar, trocar de assistente ou sair da tela.
 */
export function useChat(agentId: string) {
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const sessionId = useRef<string | undefined>(undefined);

  const send = useCallback(
    async (message: string): Promise<{ ok: true } | { ok: false; error: string }> => {
      setSending(true);
      setTranscript((t) => [...t, { role: 'user', text: message }]);
      try {
        const res = await chatService.send({ agentId, sessionId: sessionId.current, message });
        sessionId.current = res.sessionId;
        setTranscript((t) => [...t, { role: 'bot', text: res.reply }]);
        return { ok: true };
      } catch (err) {
        // Desfaz a mensagem otimista para que o usuário possa tentar de novo.
        setTranscript((t) => t.slice(0, -1));
        return { ok: false, error: apiErrorMessage(err, 'Não foi possível enviar a mensagem. Tente novamente.') };
      } finally {
        setSending(false);
      }
    },
    [agentId],
  );

  return { transcript, sending, send };
}
