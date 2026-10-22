import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AgentAdminDto } from '../../dto/agent-response.dto.js';
import { AgentsRepository } from '../../repositories/agents.repository.js';
import { ListAgentsQuery } from '../impl/list-agents.query.js';

@QueryHandler(ListAgentsQuery)
export class ListAgentsHandler implements IQueryHandler<ListAgentsQuery> {
  constructor(private readonly repo: AgentsRepository) {}

  async execute(): Promise<AgentAdminDto[]> {
    const [agents, companies] = await Promise.all([
      this.repo.findAll(),
      this.repo.findCompanies(),
    ]);
    return agents.map((a) => ({
      id: a.id,
      internalName: a.internalName,
      name: a.name,
      short: a.short,
      description: a.description,
      title: a.title,
      prompts: a.prompts,
      scope: a.scope,
      clientId: a.clientId,
      clientName: companies.find((c) => c.id === a.clientId)?.name ?? null,
      status: a.status,
      provider: a.provider,
      endpoint: a.endpoint,
      remoteId: a.remoteId,
      auth: a.auth,
      secretRef: a.secretRef,
      version: a.version,
      owner: a.owner,
      approved: a.approved,
      manualUrl: a.manualUrl,
      manualVersion: a.manualVersion,
      tested: a.tested,
      linkedCompanies: companies.filter((c) =>
        c.allowedAgents.some((x) => x.id === a.id),
      ).length,
    }));
  }
}
