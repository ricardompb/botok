import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth/roles.decorator.js';
import { BEARER } from '../../config/swagger.js';
import { GetAdminStatsQuery } from './queries/impl/get-admin-stats.query.js';
import { GetAgentUsageQuery } from './queries/impl/get-agent-usage.query.js';

@ApiTags('Administração')
@ApiBearerAuth(BEARER)
@Controller('dashboard')
@Roles('admin')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  /** Indicadores gerais: empresas, vagas, usuários ativos e agentes ativos. */
  @Get('stats')
  stats() {
    return this.queryBus.execute(new GetAdminStatsQuery());
  }

  /** Sessões iniciadas no mês por assistente (sem conteúdo). */
  @Get('usage')
  usage() {
    return this.queryBus.execute(new GetAgentUsageQuery());
  }
}
