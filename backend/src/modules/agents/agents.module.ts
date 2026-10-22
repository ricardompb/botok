import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/entities/company.entity.js';
import { AgentsController } from './agents.controller.js';
import { CatalogController } from './catalog.controller.js';
import { CommandHandlers } from './commands/handlers/index.js';
import { AgentAudit } from './entities/agent-audit.entity.js';
import { Agent } from './entities/agent.entity.js';
import { QueryHandlers } from './queries/handlers/index.js';
import { AgentsRepository } from './repositories/agents.repository.js';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Agent, AgentAudit, Company])],
  controllers: [AgentsController, CatalogController],
  providers: [AgentsRepository, ...CommandHandlers, ...QueryHandlers],
  exports: [AgentsRepository],
})
export class AgentsModule {}
