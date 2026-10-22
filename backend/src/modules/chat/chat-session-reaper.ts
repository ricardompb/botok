import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { TenantDb } from '../../common/tenancy/tenant-db.js';
import { ChatSessionCloser } from './chat-session-closer.js';
import { ChatSessionsRepository } from './repositories/chat-sessions.repository.js';

/** Prazo sem interação após o qual a conversa é descartada (como no protótipo). */
export const CHAT_INACTIVITY_MS = 30 * 60 * 1000;
const SWEEP_EVERY_MS = 60 * 1000;

/**
 * Descarte no servidor mesmo sem aviso do navegador: encerra as sessões sem
 * atividade há mais de 30 minutos e apaga suas conversas no Foundry.
 */
@Injectable()
export class ChatSessionReaper implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(ChatSessionReaper.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly db: TenantDb,
    private readonly sessions: ChatSessionsRepository,
    private readonly closer: ChatSessionCloser,
  ) {}

  onApplicationBootstrap() {
    this.timer = setInterval(() => void this.sweep(), SWEEP_EVERY_MS);
    this.timer.unref();
  }

  onApplicationShutdown() {
    clearInterval(this.timer);
  }

  async sweep(now = new Date()) {
    if (this.running) return 0;
    this.running = true;
    try {
      return await this.db.enter({ kind: 'system' }, async () => {
        const expired = await this.db.transaction(() =>
          this.sessions.findInactiveSince(new Date(now.getTime() - CHAT_INACTIVITY_MS)),
        );
        let closed = 0;
        for (const session of expired) if (await this.closer.close(session)) closed++;
        if (closed) this.logger.log(`${closed} conversa(s) inativa(s) descartada(s).`);
        return closed;
      });
    } finally {
      this.running = false;
    }
  }
}
