import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from '../agents/agents.module.js';
import { User } from '../users/entities/user.entity.js';
import { CommandHandlers } from './commands/handlers/index.js';
import { CompaniesController } from './companies.controller.js';
import { Company } from './entities/company.entity.js';
import { QueryHandlers } from './queries/handlers/index.js';
import { CompaniesRepository } from './repositories/companies.repository.js';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Company, User]), AgentsModule],
  controllers: [CompaniesController],
  providers: [CompaniesRepository, ...CommandHandlers, ...QueryHandlers],
  exports: [CompaniesRepository],
})
export class CompaniesModule {}
