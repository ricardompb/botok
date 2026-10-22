import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultAzureCredential } from '@azure/identity';
import { AgentsModule } from '../agents/agents.module.js';
import { ChatController } from './chat.controller.js';
import { ChatSessionCloser } from './chat-session-closer.js';
import { ChatSessionReaper } from './chat-session-reaper.js';
import { CommandHandlers } from './commands/handlers/index.js';
import { ChatSession } from './entities/chat-session.entity.js';
import { FOUNDRY_CREDENTIAL, FoundryGateway } from './foundry/foundry.gateway.js';
import { ChatSessionsRepository } from './repositories/chat-sessions.repository.js';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([ChatSession]), AgentsModule],
  controllers: [ChatController],
  providers: [
    // Identidade gerenciada em produção; `az login` em desenvolvimento.
    { provide: FOUNDRY_CREDENTIAL, useFactory: () => new DefaultAzureCredential() },
    FoundryGateway,
    ChatSessionsRepository,
    ChatSessionCloser,
    ChatSessionReaper,
    ...CommandHandlers,
  ],
  exports: [ChatSessionsRepository],
})
export class ChatModule {}
