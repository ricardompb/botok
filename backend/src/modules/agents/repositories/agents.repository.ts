import { Injectable } from '@nestjs/common';
import { In, IsNull } from 'typeorm';
import { TenantDb } from '../../../common/tenancy/tenant-db.js';
import { Company } from '../../companies/entities/company.entity.js';
import { AgentAudit } from '../entities/agent-audit.entity.js';
import { Agent } from '../entities/agent.entity.js';

@Injectable()
export class AgentsRepository {
  constructor(private readonly db: TenantDb) {}

  private get repo() {
    return this.db.repo(Agent);
  }

  /** Catálogo visível: tudo na plataforma; genéricos + exclusivos próprios no tenant. */
  private visible<T extends object>(where: T = {} as T) {
    const tenantId = this.db.tenantId;
    return tenantId === null ? where : [{ ...where, tenantId: IsNull() }, { ...where, tenantId }];
  }

  findAll() {
    return this.repo.find({ where: this.visible(), order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: this.visible({ id }) });
  }

  findByIds(ids: string[]) {
    return ids.length ? this.repo.find({ where: this.visible({ id: In(ids) }) }) : Promise.resolve([]);
  }

  async internalNameTaken(internalName: string, exceptId?: string) {
    const found = await this.repo
      .createQueryBuilder('a')
      .where('LOWER(a.internalName) = LOWER(:internalName)', { internalName })
      .getOne();
    return !!found && found.id !== exceptId;
  }

  countActive() {
    return this.repo.count({ where: this.visible({ status: 'active' as const }) });
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
    const { tenantId } = this.db.scope();
    return this.db.repo(Company).find({
      where: tenantId ? { id: tenantId } : {},
      relations: { allowedAgents: true },
      order: { id: 'ASC' },
    });
  }

  findCompany(id: number) {
    return this.db
      .repo(Company)
      .findOne({ where: { id: this.db.scope(id).tenantId ?? id }, relations: { allowedAgents: true } });
  }

  /** Remove o agente das empresas diferentes da destinatária. Retorna quantas foram alteradas. */
  async revokeFromOtherCompanies(agentId: string, tenantId: number) {
    const companies = await this.findCompanies();
    let removed = 0;
    for (const c of companies) {
      if (c.id !== tenantId && c.allowedAgents.some((a) => a.id === agentId)) {
        c.allowedAgents = c.allowedAgents.filter((a) => a.id !== agentId);
        await this.db.repo(Company).save(c);
        removed++;
      }
    }
    return removed;
  }

  // ---- Registro de alterações (somente plataforma) ----

  addAudit(action: string, author: string) {
    const audit = this.db.repo(AgentAudit);
    return audit.save(audit.create({ action, author }));
  }

  latestAudit(limit: number) {
    return this.db.repo(AgentAudit).find({ order: { createdAt: 'DESC', id: 'DESC' }, take: limit });
  }
}
