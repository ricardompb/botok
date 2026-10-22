import { useAsync } from '../../../shared/hooks/use-async';
import { agentsService } from '../services/agents.service';

export function useAgents() {
  const agents = useAsync(agentsService.list, []);
  const audit = useAsync(agentsService.audit, []);
  return {
    agents: agents.data,
    audit: audit.data,
    reload: () => {
      agents.reload();
      audit.reload();
    },
  };
}
