import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers/index.js';
import { SupportRequest } from './entities/support-request.entity.js';
import { SupportRequestsRepository } from './repositories/support-requests.repository.js';
import { SupportController } from './support.controller.js';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([SupportRequest])],
  controllers: [SupportController],
  providers: [SupportRequestsRepository, ...CommandHandlers],
})
export class SupportModule {}
