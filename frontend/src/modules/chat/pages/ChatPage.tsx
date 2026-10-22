import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { paths } from '../../../routes/paths';
import { useDocumentTitle } from '../../../shared/hooks/use-document-title';
import { useModal } from '../../../shared/hooks/use-modal';
import { useToast } from '../../../shared/hooks/use-toast';
import { isSafeHttps } from '../../../shared/utils/safe-https';
import type { AgentPublicDto } from '../../catalog/dto/catalog.dto';
import { useCatalog } from '../../catalog/hooks/use-catalog';
import { ChatEmpty } from '../components/ChatEmpty';
import { ChatHead } from '../components/ChatHead';
import { ChatSidebar } from '../components/ChatSidebar';
import { Composer } from '../components/Composer';
import { CopyFallback } from '../components/CopyFallback';
import { MessageThread } from '../components/MessageThread';
import { useChat } from '../hooks/use-chat';
import { useInactivity } from '../hooks/use-inactivity';

const INACTIVITY_LIMIT = 30 * 60 * 1000;

/** Resolve o assistente da URL; cada troca de assistente recria a conversa. */
export function ChatRoute() {
  const { agentId = '' } = useParams();
  const { catalog } = useCatalog();
  const toast = useToast();
  const agent = catalog?.available.find((a) => a.id === agentId);
  const unavailable = !!catalog && !agent;

  useEffect(() => {
    if (unavailable) toast('Este assistente não está contratado para a empresa.');
  }, [unavailable, toast]);

  if (!catalog) return null;
  if (!agent) return <Navigate to={paths.catalog} replace />;
  return <ChatPage key={agent.id} agent={agent} agents={catalog.available} />;
}

interface Props {
  agent: AgentPublicDto;
  agents: AgentPublicDto[];
}

export function ChatPage({ agent, agents }: Props) {
  useDocumentTitle(agent.short);
  const navigate = useNavigate();
  const toast = useToast();
  const { open, close, dismiss, info } = useModal();
  const { transcript, sending, send } = useChat(agent.id);
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  // Saídas já confirmadas (encerrar, inatividade) não passam pelo bloqueio.
  const bypass = useRef(false);
  const hasContent = transcript.length > 0 || draft.trim() !== '';

  const confirmDiscard = useCallback(
    (onConfirm: () => void, onCancel?: () => void) =>
      open({
        title: 'Encerrar esta conversa?',
        body: <p>As mensagens e o rascunho serão descartados. Copie o que desejar guardar antes de continuar.</p>,
        actions: (
          <>
            <button className="button secondary" onClick={dismiss}>
              Continuar conversa
            </button>
            <button
              className="button"
              id="confirm-end"
              onClick={() => {
                close();
                onConfirm();
              }}
            >
              Encerrar e continuar
            </button>
          </>
        ),
        onCancel,
      }),
    [open, close, dismiss],
  );

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !bypass.current && hasContent && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === 'blocked') confirmDiscard(blocker.proceed, blocker.reset);
  }, [blocker, confirmDiscard]);

  const leave = useCallback(
    (message: string) => {
      bypass.current = true;
      navigate(paths.catalog);
      toast(message);
    },
    [navigate, toast],
  );

  useInactivity(INACTIVITY_LIMIT, () => {
    close();
    leave('Sessão encerrada por inatividade. A conversa foi descartada.');
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = messagesRef.current;
    if (el && transcript.length) el.scrollTop = el.scrollHeight;
  }, [transcript]);

  const endChat = () => {
    const finish = () => leave('Conversa encerrada. O conteúdo foi descartado.');
    if (hasContent) confirmDiscard(finish);
    else finish();
  };

  const handleSend = async () => {
    const value = draft.trim();
    if (!value || sending) return;
    setDraft('');
    const result = await send(value);
    if (!result.ok) {
      if (result.restoreDraft) setDraft(value);
      toast(result.error);
    }
    inputRef.current?.focus();
  };

  const applyPrompt = (text: string) => {
    setDraft(text);
    inputRef.current?.focus();
  };

  const copy = async (text: string) => {
    try {
      if (!navigator.clipboard) throw new Error();
      await navigator.clipboard.writeText(text);
      toast('Resposta copiada.');
    } catch {
      open({
        title: 'Copiar resposta',
        body: <CopyFallback text={text} />,
        actions: (
          <button className="button" onClick={dismiss}>
            Concluir
          </button>
        ),
      });
    }
  };

  const openManual = () =>
    info(
      'Manual de Bordo',
      <>
        <p>
          <b>{agent.name}</b> · versão {agent.manualVersion}
        </p>
        {agent.manualUrl && isSafeHttps(agent.manualUrl) ? (
          <p>
            <a className="button secondary" href={agent.manualUrl} target="_blank" rel="noopener noreferrer">
              Abrir manual aprovado ↗
            </a>
          </p>
        ) : (
          <p>O Manual de Bordo existente será vinculado pela IT’s OK. Seu conteúdo não foi fornecido para esta demonstração.</p>
        )}
        <p>O manual reúne as orientações, sugestões de uso e funcionalidades aprovadas para este assistente.</p>
      </>,
    );

  return (
    <section id="view-chat" className="view">
      <div className={'chat-layout' + (focused ? ' focus' : '')} id="chat-layout">
        <ChatSidebar
          agents={agents}
          selectedId={agent.id}
          onSelect={(id) => id !== agent.id && navigate(paths.chat(id))}
          onBack={() => navigate(paths.catalog)}
        />
        <div className="chat-main">
          <ChatHead
            name={agent.name}
            focused={focused}
            onManual={openManual}
            onToggleFocus={() => setFocused((f) => !f)}
            onEnd={endChat}
          />
          <div className="messages" id="messages" ref={messagesRef}>
            <ChatEmpty agent={agent} hidden={transcript.length > 0} onPrompt={applyPrompt} />
            <MessageThread transcript={transcript} onCopy={copy} />
          </div>
          <Composer ref={inputRef} value={draft} sending={sending} onChange={setDraft} onSend={handleSend} />
        </div>
      </div>
    </section>
  );
}
