import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Roles } from '../../common/auth/roles.decorator.js';
import { GetAdminStatsQuery } from './queries/impl/get-admin-stats.query.js';
import { GetAgentUsageQuery } from './queries/impl/get-agent-usage.query.js';

@Controller('dashboard')
@Roles('admin')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('stats')
  stats() {
    return this.queryBus.execute(new GetAdminStatsQuery());
  }

  @Get('usage')
  usage() {
    return this.queryBus.execute(new GetAgentUsageQuery());
  }
}
