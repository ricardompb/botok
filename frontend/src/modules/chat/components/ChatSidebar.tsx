import { Icon } from '../../../shared/components/Icon';
import type { AgentPublicDto } from '../../catalog/dto/catalog.dto';

interface Props {
  agents: AgentPublicDto[];
  selectedId: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function ChatSidebar({ agents, selectedId, onSelect, onBack }: Props) {
  return (
    <aside className="chat-sidebar">
      <button className="button secondary small" data-page="catalog" onClick={onBack}>
        ← Todos os assistentes
      </button>
      <div>
        <span className="eyebrow">Assistentes disponíveis</span>
        <nav id="side-agents" aria-label="Trocar de assistente">
          {agents.map((a) => (
            <button
              key={a.id}
              className={'side-agent ' + (a.id === selectedId ? 'active' : '')}
              data-agent={a.id}
              aria-current={a.id === selectedId ? 'page' : undefined}
              onClick={() => onSelect(a.id)}
            >
              <Icon name={a.icon} />
              {a.short}
            </button>
          ))}
        </nav>
      </div>
      <div className="sidebar-bottom">
        <Icon name="shield" />
        <b>Uma conversa por vez.</b>O contexto acompanha esta sessão. Ao encerrá-la, o conteúdo é descartado.
        <br />
        <br />
        Copie o resultado antes de sair.
      </div>
    </aside>
  );
}
