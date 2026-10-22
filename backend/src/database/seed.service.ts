import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Agent } from '../modules/agents/entities/agent.entity.js';
import { ChatSession } from '../modules/chat/entities/chat-session.entity.js';
import { Company } from '../modules/companies/entities/company.entity.js';
import { User } from '../modules/users/entities/user.entity.js';
import {
  SEED_ADMIN,
  SEED_AGENT_REGISTRY,
  SEED_AGENTS,
  SEED_COMPANIES,
  SEED_LAST_ACCESS_DAYS,
  SEED_USAGE,
} from './seed-data.js';

const DAY = 24 * 60 * 60 * 1000;

/** Popula o banco vazio com o cenário do protótipo. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Agent) private readonly agents: Repository<Agent>,
    @InjectRepository(Company) private readonly companies: Repository<Company>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(ChatSession)
    private readonly sessions: Repository<ChatSession>,
  ) {}

  async onApplicationBootstrap() {
    if (await this.agents.count()) return;

    const passwordHash = await bcrypt.hash(
      this.config.get('DEFAULT_PASSWORD', 'botok123'),
      10,
    );
    const agents = await this.agents.save(
      SEED_AGENTS.map((a) =>
        this.agents.create({
          ...a,
          ...SEED_AGENT_REGISTRY,
          remoteId: `agent-${a.id}`,
        }),
      ),
    );

    const now = Date.now();
    let firstUserId = '';
    let firstCompanyId = 0;
    for (const c of SEED_COMPANIES) {
      const [d, m, y] = c.until.split('/');
      const company = await this.companies.save(
        this.companies.create({
          name: c.name,
          licenses: c.licenses,
          quota: c.quota,
          until: `${y}-${m}-${d}`,
          allowedAgents: agents.filter((a) => c.allowed.includes(a.id)),
        }),
      );
      // Um a um, para preservar a ordem de cadastro do protótipo.
      for (const u of c.users) {
        const user = await this.users.save(
          this.users.create({
            name: u.name,
            email: u.email,
            active: u.active,
            role: 'user',
            passwordHash,
            companyId: company.id,
            lastAccessAt: new Date(now - SEED_LAST_ACCESS_DAYS[u.last] * DAY),
          }),
        );
        firstUserId ||= user.id;
      }
      firstCompanyId ||= company.id;
    }

    await this.users.save(
      this.users.create({ ...SEED_ADMIN, role: 'admin', passwordHash }),
    );

    await this.sessions.save(
      Object.entries(SEED_USAGE).flatMap(([agentId, count]) =>
        Array.from({ length: count }, () =>
          this.sessions.create({
            agentId,
            companyId: firstCompanyId,
            userId: firstUserId,
            messageCount: 2,
          }),
        ),
      ),
    );

    this.logger.log('Banco populado com o cenário do protótipo.');
  }
}
