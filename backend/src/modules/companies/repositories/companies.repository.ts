import { Injectable } from '@nestjs/common';
import type { DeepPartial } from 'typeorm';
import { TenantDb } from '../../../common/tenancy/tenant-db.js';
import { User } from '../../users/entities/user.entity.js';
import { Company } from '../entities/company.entity.js';

@Injectable()
export class CompaniesRepository {
  constructor(private readonly db: TenantDb) {}

  private get repo() {
    return this.db.repo(Company);
  }

  /** Em contexto de tenant, a própria empresa é o único registro visível. */
  private scopeById(id?: number) {
    const { tenantId } = this.db.scope(id);
    return tenantId ? { id: tenantId } : {};
  }

  findAll() {
    return this.repo.find({
      where: this.scopeById(),
      relations: { allowedAgents: true },
      order: { id: 'ASC' },
    });
  }

  findById(id: number) {
    return this.repo.findOne({ where: this.scopeById(id), relations: { allowedAgents: true } });
  }

  create(data: DeepPartial<Company>) {
    return this.repo.save(this.repo.create(data));
  }

  save(company: Company) {
    this.db.scope(company.id);
    return this.repo.save(company);
  }

  async activeUsersByTenant(): Promise<Map<number, number>> {
    const { tenantId } = this.db.scope();
    const qb = this.db
      .repo(User)
      .createQueryBuilder('u')
      .select('u.tenantId', 'tenantId')
      .addSelect('COUNT(*)', 'total')
      .where('u.active = true AND u.tenantId IS NOT NULL');
    if (tenantId) qb.andWhere('u.tenantId = :tenantId', { tenantId });
    const rows = await qb.groupBy('u.tenantId').getRawMany<{ tenantId: number; total: string }>();
    return new Map(rows.map((r) => [Number(r.tenantId), Number(r.total)]));
  }
}
