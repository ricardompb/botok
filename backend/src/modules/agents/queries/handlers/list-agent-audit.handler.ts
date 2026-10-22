import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AgentsRepository } from '../../repositories/agents.repository.js';
import { ListAgentAuditQuery } from '../impl/list-agent-audit.query.js';

@QueryHandler(ListAgentAuditQuery)
export class ListAgentAuditHandler implements IQueryHandler<ListAgentAuditQuery> {
  constructor(private readonly repo: AgentsRepository) {}

  async execute() {
    const entries = await this.repo.latestAudit(12);
    return entries.map((e) => ({
      action: e.action,
      author: e.author,
      at: e.createdAt.toISOString(),
    }));
  }
}
