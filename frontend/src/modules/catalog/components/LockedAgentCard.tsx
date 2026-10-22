import type { AgentSummaryDto } from '../dto/catalog.dto';

interface Props {
  agent: AgentSummaryDto;
  onAbout: (agent: AgentSummaryDto) => void;
}

export function LockedAgentCard({ agent, onAbout }: Props) {
  return (
    <article className="agent-card locked">
      <div>
        <h3>{agent.name}</h3>
        <p>{agent.description}</p>
      </div>
      <button className="button ghost small" data-about-agent={agent.id} onClick={() => onAbout(agent)}>
        Conhecer →
      </button>
    </article>
  );
}
