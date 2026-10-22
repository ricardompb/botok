import { Injectable } from '@nestjs/common';
import type { DeepPartial } from 'typeorm';
import { TenantDb } from '../../../common/tenancy/tenant-db.js';
import { SupportRequest } from '../entities/support-request.entity.js';

@Injectable()
export class SupportRequestsRepository {
  constructor(private readonly db: TenantDb) {}

  /** Grava a solicitação no tenant atual e gera o protocolo a partir do identificador. */
  async create(data: DeepPartial<SupportRequest>) {
    const repo = this.db.repo(SupportRequest);
    const request = await repo.save(repo.create({ ...data, tenantId: this.db.tenantId }));
    request.protocol = 'DEMO-' + String(request.id).padStart(4, '0');
    return repo.save(request);
  }
}
