import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: { company: true } });
  }

  findByEmail(email: string) {
    return this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.company', 'company')
      .where('LOWER(u.email) = LOWER(:email)', { email: email.trim() })
      .getOne();
  }

  listByCompany(companyId: number) {
    return this.repo.find({ where: { companyId }, order: { createdAt: 'ASC' } });
  }

  countActive(companyId?: number) {
    return this.repo.count({
      where: { active: true, role: 'user', ...(companyId ? { companyId } : {}) },
    });
  }

  create(data: DeepPartial<User>) {
    return this.repo.save(this.repo.create(data));
  }

  save(user: User) {
    return this.repo.save(user);
  }

  touchLastAccess(id: string) {
    return this.repo.update(id, { lastAccessAt: new Date() });
  }
}
