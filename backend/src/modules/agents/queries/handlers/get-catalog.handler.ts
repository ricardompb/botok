import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { isAvailableTo } from '../../agent-policy.js';
import { AgentPublicDto, CatalogResponseDto } from '../../dto/agent-response.dto.js';
import { AgentsRepository } from '../../repositories/agents.repository.js';
import { GetCatalogQuery } from '../impl/get-catalog.query.js';

@QueryHandler(GetCatalogQuery)
export class GetCatalogHandler implements IQueryHandler<GetCatalogQuery> {
  constructor(private readonly repo: AgentsRepository) {}

  async execute({ companyId }: GetCatalogQuery): Promise<CatalogResponseDto> {
    const company = await this.repo.findCompany(companyId);
    const agents = await this.repo.findAll();
    if (!company) throw new NotFoundException('Empresa não encontrada.');
    const allowed = new Set(company.allowedAgents.map((a) => a.id));
    return {
      available: agents.filter((a) => isAvailableTo(a, company)).map(AgentPublicDto.from),
      others: agents
        .filter((a) => a.status === 'active' && a.scope === 'generic' && !allowed.has(a.id))
        .map((a) => ({ id: a.id, name: a.name, description: a.description })),
    };
  }
}
