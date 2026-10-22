import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from '../agents/agents.module.js';
import { ChatController } from './chat.controller.js';
import { CommandHandlers } from './commands/handlers/index.js';
import { ChatSession } from './entities/chat-session.entity.js';
import { ChatSessionsRepository } from './repositories/chat-sessions.repository.js';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([ChatSession]), AgentsModule],
  controllers: [ChatController],
  providers: [ChatSessionsRepository, ...CommandHandlers],
  exports: [ChatSessionsRepository],
})
export class ChatModule {}
