import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TenantDb } from '../../../../common/tenancy/tenant-db.js';
import { ChatSessionCloser } from '../../chat-session-closer.js';
import { ChatSessionsRepository } from '../../repositories/chat-sessions.repository.js';
import { EndChatSessionCommand } from '../impl/end-chat-session.command.js';

/** Encerramento explícito: descarta a conversa no Foundry. Idempotente. */
@CommandHandler(EndChatSessionCommand)
export class EndChatSessionHandler implements ICommandHandler<EndChatSessionCommand> {
  constructor(
    private readonly db: TenantDb,
    private readonly sessions: ChatSessionsRepository,
    private readonly closer: ChatSessionCloser,
  ) {}

  async execute({ user, sessionId }: EndChatSessionCommand) {
    const session = await this.db.transaction(() => this.sessions.findOwned(sessionId, user.id));
    if (session && !session.endedAt) await this.closer.close(session);
  }
}
