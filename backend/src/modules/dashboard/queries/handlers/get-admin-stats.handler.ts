import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AgentsRepository } from '../../../agents/repositories/agents.repository.js';
import { CompaniesRepository } from '../../../companies/repositories/companies.repository.js';
import { UsersRepository } from '../../../users/repositories/users.repository.js';
import { AdminStatsDto } from '../../dto/dashboard-response.dto.js';
import { GetAdminStatsQuery } from '../impl/get-admin-stats.query.js';

@QueryHandler(GetAdminStatsQuery)
export class GetAdminStatsHandler implements IQueryHandler<GetAdminStatsQuery> {
  constructor(
    private readonly companies: CompaniesRepository,
    private readonly users: UsersRepository,
    private readonly agents: AgentsRepository,
  ) {}

  async execute(): Promise<AdminStatsDto> {
    const companies = await this.companies.findAll();
    const activeUsers = await this.users.countActive();
    const activeAgents = await this.agents.countActive();
    return {
      companies: companies.length,
      licenses: companies.reduce((n, c) => n + c.licenses, 0),
      activeUsers,
      activeAgents,
    };
  }
}
