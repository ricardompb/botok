import { Icon } from '../../../shared/components/Icon';
import type { AgentPublicDto } from '../dto/catalog.dto';

interface Props {
  agent: AgentPublicDto;
  featured: boolean;
  onStart: (id: string) => void;
}

export function AgentCard({ agent, featured, onStart }: Props) {
  return (
    <article className={'agent-card ' + (featured ? 'featured' : '')}>
      <div className="row between">
        <span className="agent-symbol">
          <Icon name={agent.icon} />
        </span>
        <span className="pill">Disponível</span>
      </div>
      <h3>{agent.name}</h3>
      <p>{agent.description}</p>
      <button className="button secondary" data-agent={agent.id} onClick={() => onStart(agent.id)}>
        Conversar <Icon name="arrow" />
      </button>
    </article>
  );
}
