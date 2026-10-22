import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { CommandHandlers } from './commands/handlers/index.js';
import { User } from './entities/user.entity.js';
import { QueryHandlers } from './queries/handlers/index.js';
import { UsersRepository } from './repositories/users.repository.js';
import { UsersController } from './users.controller.js';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User]), CompaniesModule],
  controllers: [UsersController],
  providers: [UsersRepository, ...CommandHandlers, ...QueryHandlers],
  exports: [UsersRepository],
})
export class UsersModule {}
