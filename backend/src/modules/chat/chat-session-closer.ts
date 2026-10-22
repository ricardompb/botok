import { Injectable, Logger } from '@nestjs/common';
import { TenantDb } from '../../common/tenancy/tenant-db.js';
import type { ChatSession } from './entities/chat-session.entity.js';
import { FoundryGateway } from './foundry/foundry.gateway.js';
import { ChatSessionsRepository } from './repositories/chat-sessions.repository.js';

/** Encerra uma sessão: apaga a conversa no Foundry e registra apenas o fim. */
@Injectable()
export class ChatSessionCloser {
  private readonly logger = new Logger(ChatSessionCloser.name);

  constructor(
    private readonly db: TenantDb,
    private readonly sessions: ChatSessionsRepository,
    private readonly foundry: FoundryGateway,
  ) {}

  /** Chamado fora de transação: o descarte remoto é uma chamada de rede. */
  async close(session: ChatSession) {
    if (session.remoteEndpoint && (session.remoteConversationId || session.remoteResponseIds.length)) {
      try {
        await this.foundry.discard(session.remoteEndpoint, session.remoteConversationId, session.remoteResponseIds);
      } catch (err) {
        // Mantém a sessão aberta para nova tentativa do coletor de inatividade.
        this.logger.warn(`Falha ao descartar a conversa da sessão ${session.id}: ${(err as Error).message}`);
        return false;
      }
    }
    await this.db.transaction(async () => {
      session.remoteConversationId = null;
      session.remoteResponseIds = [];
      session.endedAt = new Date();
      await this.sessions.save(session);
    });
    return true;
  }
}
