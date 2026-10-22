import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { canBeGranted } from '../../../agents/agent-policy.js';
import { AgentsRepository } from '../../../agents/repositories/agents.repository.js';
import { CompanyDetailDto } from '../../dto/company-response.dto.js';
import { CompaniesRepository } from '../../repositories/companies.repository.js';
import { GetCompanyQuery } from '../impl/get-company.query.js';

@QueryHandler(GetCompanyQuery)
export class GetCompanyHandler implements IQueryHandler<GetCompanyQuery> {
  constructor(
    private readonly repo: CompaniesRepository,
    private readonly agents: AgentsRepository,
  ) {}

  async execute({ id }: GetCompanyQuery): Promise<CompanyDetailDto> {
    const company = await this.repo.findById(id);
    if (!company) throw new NotFoundException('Empresa não encontrada.');
    const [agents, active] = await Promise.all([
      this.agents.findAll(),
      this.repo.activeUsersByTenant(),
    ]);
    return {
      id: company.id,
      name: company.name,
      licenses: company.licenses,
      quota: company.quota,
      until: company.until,
      activeUsers: active.get(company.id) ?? 0,
      allowedAgentIds: company.allowedAgents.map((a) => a.id),
      entitlementOptions: agents
        .filter((a) => canBeGranted(a, company.id))
        .map((a) => ({ id: a.id, name: a.name })),
    };
  }
}
