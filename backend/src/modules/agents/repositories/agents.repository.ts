import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Company } from '../../companies/entities/company.entity.js';
import { AgentAudit } from '../entities/agent-audit.entity.js';
import { Agent } from '../entities/agent.entity.js';

@Injectable()
export class AgentsRepository {
  constructor(
    @InjectRepository(Agent) private readonly repo: Repository<Agent>,
    @InjectRepository(AgentAudit) private readonly audit: Repository<AgentAudit>,
    @InjectRepository(Company) private readonly companies: Repository<Company>,
  ) {}

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  findByIds(ids: string[]) {
    return ids.length ? this.repo.findBy({ id: In(ids) }) : Promise.resolve([]);
  }

  async internalNameTaken(internalName: string, exceptId?: string) {
    const found = await this.repo
      .createQueryBuilder('a')
      .where('LOWER(a.internalName) = LOWER(:internalName)', { internalName })
      .getOne();
    return !!found && found.id !== exceptId;
  }

  countActive() {
    return this.repo.countBy({ status: 'active' });
  }

  async nextIdentity() {
    const total = await this.repo.count();
    let n = total + 1;
    while (await this.repo.existsBy({ id: `agent-${n}` })) n++;
    return { id: `agent-${n}`, sortOrder: n };
  }

  save(agent: Agent) {
    return this.repo.save(agent);
  }

  create(data: Partial<Agent>) {
    return this.repo.save(this.repo.create(data));
  }

  async remove(agent: Agent) {
    await this.repo.remove(agent);
  }

  // ---- Vínculos com empresas ----

  findCompanies() {
    return this.companies.find({
      relations: { allowedAgents: true },
      order: { id: 'ASC' },
    });
  }

  findCompany(id: number) {
    return this.companies.findOne({ where: { id }, relations: { allowedAgents: true } });
  }

  /** Remove o agente das empresas diferentes da destinatária. Retorna quantas foram alteradas. */
  async revokeFromOtherCompanies(agentId: string, clientId: number) {
    const companies = await this.findCompanies();
    let removed = 0;
    for (const c of companies) {
      if (c.id !== clientId && c.allowedAgents.some((a) => a.id === agentId)) {
        c.allowedAgents = c.allowedAgents.filter((a) => a.id !== agentId);
        await this.companies.save(c);
        removed++;
      }
    }
    return removed;
  }

  // ---- Registro de alterações ----

  addAudit(action: string, author: string) {
    return this.audit.save(this.audit.create({ action, author }));
  }

  latestAudit(limit: number) {
    return this.audit.find({ order: { createdAt: 'DESC', id: 'DESC' }, take: limit });
  }
}
