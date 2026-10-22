import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { startOfMonth } from '../../../../common/utils/dates.js';
import { AgentsRepository } from '../../../agents/repositories/agents.repository.js';
import { ChatSessionsRepository } from '../../../chat/repositories/chat-sessions.repository.js';
import { AgentUsageDto } from '../../dto/dashboard-response.dto.js';
import { GetAgentUsageQuery } from '../impl/get-agent-usage.query.js';

/** Sessões iniciadas no mês corrente, por assistente (sem conteúdo). */
@QueryHandler(GetAgentUsageQuery)
export class GetAgentUsageHandler implements IQueryHandler<GetAgentUsageQuery> {
  constructor(
    private readonly sessions: ChatSessionsRepository,
    private readonly agents: AgentsRepository,
  ) {}

  async execute(): Promise<AgentUsageDto[]> {
    const counts = await this.sessions.countByAgentSince(startOfMonth());
    const agents = await this.agents.findAll();
    return agents
      .filter((a) => counts.has(a.id))
      .map((a) => ({ agentId: a.id, name: a.name, sessions: counts.get(a.id)! }))
      .sort((a, b) => b.sessions - a.sessions);
  }
}
