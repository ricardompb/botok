import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Company } from '../entities/company.entity.js';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectRepository(Company) private readonly repo: Repository<Company>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findAll() {
    return this.repo.find({
      relations: { allowedAgents: true },
      order: { id: 'ASC' },
    });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id }, relations: { allowedAgents: true } });
  }

  create(data: DeepPartial<Company>) {
    return this.repo.save(this.repo.create(data));
  }

  save(company: Company) {
    return this.repo.save(company);
  }

  async activeUsersByCompany(): Promise<Map<number, number>> {
    const rows = await this.users
      .createQueryBuilder('u')
      .select('u.companyId', 'companyId')
      .addSelect('COUNT(*)', 'total')
      .where('u.active = true AND u.companyId IS NOT NULL')
      .groupBy('u.companyId')
      .getRawMany<{ companyId: number; total: string }>();
    return new Map(rows.map((r) => [Number(r.companyId), Number(r.total)]));
  }
}
