import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AgentsModule } from '../agents/agents.module.js';
import { ChatModule } from '../chat/chat.module.js';
import { CompaniesModule } from '../companies/companies.module.js';
import { UsersModule } from '../users/users.module.js';
import { DashboardController } from './dashboard.controller.js';
import { QueryHandlers } from './queries/handlers/index.js';

@Module({
  imports: [CqrsModule, AgentsModule, CompaniesModule, UsersModule, ChatModule],
  controllers: [DashboardController],
  providers: [...QueryHandlers],
})
export class DashboardModule {}
