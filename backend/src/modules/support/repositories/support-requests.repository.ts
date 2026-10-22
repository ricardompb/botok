import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { SupportRequest } from '../entities/support-request.entity.js';

@Injectable()
export class SupportRequestsRepository {
  constructor(
    @InjectRepository(SupportRequest)
    private readonly repo: Repository<SupportRequest>,
  ) {}

  /** Grava a solicitação e gera o protocolo a partir do identificador. */
  async create(data: DeepPartial<SupportRequest>) {
    const request = await this.repo.save(this.repo.create(data));
    request.protocol = 'DEMO-' + String(request.id).padStart(4, '0');
    return this.repo.save(request);
  }
}
