import { Injectable } from '@nestjs/common';
import type { DeepPartial } from 'typeorm';
import { TenantDb } from '../../../common/tenancy/tenant-db.js';
import { User } from '../entities/user.entity.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: TenantDb) {}

  private get repo() {
    return this.db.repo(User);
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id, ...this.db.scope() }, relations: { company: true } });
  }

  findByEmail(email: string) {
    const scope = this.db.scope();
    const qb = this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.company', 'company')
      .where('LOWER(u.email) = LOWER(:email)', { email: email.trim() });
    if (scope.tenantId) qb.andWhere('u.tenantId = :tenantId', scope);
    return qb.getOne();
  }

  findByEntraIdentity(tenantId: string, objectId: string) {
    return this.repo.findOne({
      where: { entraTenantId: tenantId, entraObjectId: objectId, ...this.db.scope() },
      relations: { company: true },
    });
  }

  listByTenant(tenantId: number) {
    return this.repo.find({ where: this.db.scope(tenantId), order: { createdAt: 'ASC' } });
  }

  countActive(tenantId?: number) {
    return this.repo.count({ where: { active: true, role: 'user', ...this.db.scope(tenantId) } });
  }

  create(data: DeepPartial<User>) {
    return this.repo.save(this.repo.create({ ...data, ...this.db.scope(data.tenantId) }));
  }

  save(user: User) {
    this.db.scope(user.tenantId);
    return this.repo.save(user);
  }

  touchLastAccess(id: string) {
    return this.repo.update({ id, ...this.db.scope() }, { lastAccessAt: new Date() });
  }
}
