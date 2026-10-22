import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { applyRowLevelSecurity } from '../common/tenancy/rls.js';
import { TenantDb } from '../common/tenancy/tenant-db.js';
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
/** Serializa a inicialização entre instâncias que sobem juntas. */
const BOOTSTRAP_LOCK = 7_420_001;

/** Aplica o Row-Level Security e popula o banco vazio com o cenário do protótipo. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly db: TenantDb,
  ) {}

  onApplicationBootstrap() {
    return this.db.run({ kind: 'system' }, async () => {
      const agents = this.db.repo(Agent);
      await agents.query('SELECT pg_advisory_xact_lock($1)', [BOOTSTRAP_LOCK]);
      await applyRowLevelSecurity(agents.manager);
      if (!(await agents.count())) await this.seed();
    });
  }

  private async seed() {
    const agentsRepo = this.db.repo(Agent);
    const companies = this.db.repo(Company);
    const users = this.db.repo(User);
    const sessions = this.db.repo(ChatSession);

    const passwordHash = await bcrypt.hash(this.config.get('DEFAULT_PASSWORD', 'botok123'), 10);
    // Projeto Foundry inicial dos agentes; o nome de cada agente é ajustado no console.
    const endpoint = this.config.get('FOUNDRY_PROJECT_ENDPOINT') || SEED_AGENT_REGISTRY.endpoint;
    const agents = await agentsRepo.save(
      SEED_AGENTS.map((a) =>
        agentsRepo.create({ ...a, ...SEED_AGENT_REGISTRY, endpoint, tenantId: null, remoteId: `botok-${a.id}` }),
      ),
    );

    const now = Date.now();
    let firstUserId = '';
    let firstTenantId = 0;
    for (const c of SEED_COMPANIES) {
      const [d, m, y] = c.until.split('/');
      const company = await companies.save(
        companies.create({
          name: c.name,
          licenses: c.licenses,
          quota: c.quota,
          until: `${y}-${m}-${d}`,
          allowedAgents: agents.filter((a) => c.allowed.includes(a.id)),
        }),
      );
      // Um a um, para preservar a ordem de cadastro do protótipo.
      for (const u of c.users) {
        const user = await users.save(
          users.create({
            name: u.name,
            email: u.email,
            active: u.active,
            role: 'user',
            passwordHash,
            tenantId: company.id,
            lastAccessAt: new Date(now - SEED_LAST_ACCESS_DAYS[u.last] * DAY),
          }),
        );
        firstUserId ||= user.id;
      }
      firstTenantId ||= company.id;
    }

    await users.save(users.create({ ...SEED_ADMIN, role: 'admin', passwordHash, tenantId: null }));

    await sessions.save(
      Object.entries(SEED_USAGE).flatMap(([agentId, count]) =>
        Array.from({ length: count }, () =>
          sessions.create({ agentId, tenantId: firstTenantId, userId: firstUserId, messageCount: 2, endedAt: new Date() }),
        ),
      ),
    );

    this.logger.log('Banco populado com o cenário do protótipo.');
  }
}
