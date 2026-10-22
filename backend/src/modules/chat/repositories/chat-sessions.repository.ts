import { Injectable } from '@nestjs/common';
import { IsNull, LessThan, type DeepPartial } from 'typeorm';
import { TenantDb } from '../../../common/tenancy/tenant-db.js';
import { ChatSession } from '../entities/chat-session.entity.js';

@Injectable()
export class ChatSessionsRepository {
  constructor(private readonly db: TenantDb) {}

  private get repo() {
    return this.db.repo(ChatSession);
  }

  /** Sessão em andamento do próprio usuário, com o mesmo assistente. */
  findOpen(id: string, userId: string, agentId: string) {
    return this.repo.findOneBy({ id, userId, agentId, endedAt: IsNull(), ...this.db.scope() });
  }

  findOwned(id: string, userId: string) {
    return this.repo.findOneBy({ id, userId, ...this.db.scope() });
  }

  findInactiveSince(limit: Date) {
    return this.repo.find({
      where: { endedAt: IsNull(), lastActivityAt: LessThan(limit), ...this.db.scope() },
      take: 100,
    });
  }

  create(data: DeepPartial<ChatSession>) {
    return this.repo.save(this.repo.create({ ...data, ...this.db.scope(data.tenantId) }));
  }

  save(session: ChatSession) {
    this.db.scope(session.tenantId);
    return this.repo.save(session);
  }

  async countByAgentSince(since: Date): Promise<Map<string, number>> {
    const { tenantId } = this.db.scope();
    const qb = this.repo
      .createQueryBuilder('s')
      .select('s.agentId', 'agentId')
      .addSelect('COUNT(*)', 'total')
      .where('s.startedAt >= :since', { since });
    if (tenantId) qb.andWhere('s.tenantId = :tenantId', { tenantId });
    const rows = await qb.groupBy('s.agentId').getRawMany<{ agentId: string; total: string }>();
    return new Map(rows.map((r) => [r.agentId, Number(r.total)]));
  }
}
