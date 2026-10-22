import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ChatSession } from '../entities/chat-session.entity.js';

@Injectable()
export class ChatSessionsRepository {
  constructor(
    @InjectRepository(ChatSession) private readonly repo: Repository<ChatSession>,
  ) {}

  findOwned(id: string, userId: string, agentId: string) {
    return this.repo.findOneBy({ id, userId, agentId });
  }

  create(data: DeepPartial<ChatSession>) {
    return this.repo.save(this.repo.create(data));
  }

  save(session: ChatSession) {
    return this.repo.save(session);
  }

  async countByAgentSince(since: Date): Promise<Map<string, number>> {
    const rows = await this.repo
      .createQueryBuilder('s')
      .select('s.agentId', 'agentId')
      .addSelect('COUNT(*)', 'total')
      .where('s.startedAt >= :since', { since })
      .groupBy('s.agentId')
      .getRawMany<{ agentId: string; total: string }>();
    return new Map(rows.map((r) => [r.agentId, Number(r.total)]));
  }
}
