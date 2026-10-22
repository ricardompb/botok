import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CompanyListItemDto } from '../../dto/company-response.dto.js';
import { CompaniesRepository } from '../../repositories/companies.repository.js';
import { ListCompaniesQuery } from '../impl/list-companies.query.js';

@QueryHandler(ListCompaniesQuery)
export class ListCompaniesHandler implements IQueryHandler<ListCompaniesQuery> {
  constructor(private readonly repo: CompaniesRepository) {}

  async execute(): Promise<CompanyListItemDto[]> {
    const companies = await this.repo.findAll();
    const active = await this.repo.activeUsersByTenant();
    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      agents: [...c.allowedAgents]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((a) => a.short),
      activeUsers: active.get(c.id) ?? 0,
      licenses: c.licenses,
      quota: c.quota,
      until: c.until,
    }));
  }
}
