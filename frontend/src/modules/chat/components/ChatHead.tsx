import { Icon } from '../../../shared/components/Icon';

interface Props {
  name: string;
  focused: boolean;
  onManual: () => void;
  onToggleFocus: () => void;
  onEnd: () => void;
}

export function ChatHead({ name, focused, onManual, onToggleFocus, onEnd }: Props) {
  const focusLabel = focused ? 'Restaurar barra lateral' : 'Ampliar área de conversa';
  return (
    <div className="chat-head">
      <div>
        <h2 id="chat-name">{name}</h2>
        <div className="muted">IT’s OK · Apoio à comunicação</div>
      </div>
      <div className="row">
        <button className="button secondary small" data-manual onClick={onManual}>
          Manual de Bordo
        </button>
        <button
          className="icon-button"
          id="focus"
          aria-label={focusLabel}
          title={focusLabel}
          aria-pressed={focused}
          onClick={onToggleFocus}
        >
          <Icon name="expand" />
        </button>
        <button className="button secondary small" id="end-chat" onClick={onEnd}>
          <Icon name="close" />
          <span className="end-label">Encerrar conversa</span>
        </button>
      </div>
    </div>
  );
}
