import type { ChatMessage } from '../dto/chat.dto';

interface Props {
  transcript: ChatMessage[];
  onCopy: (text: string) => void;
}

export function MessageThread({ transcript, onCopy }: Props) {
  return (
    <div className="thread" id="thread" aria-live="polite" aria-relevant="additions">
      {transcript.map((m, i) => (
        <article key={i} className={'message ' + m.role}>
          <div className="by">{m.role === 'user' ? 'Você' : 'BOTOK · Resposta de demonstração'}</div>
          <div className="content">{m.text}</div>
          {m.role === 'bot' && (
            <button className="button ghost small copy" data-copy={i} onClick={() => onCopy(m.text)}>
              Copiar resposta
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
