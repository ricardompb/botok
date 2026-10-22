import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcryptjs';
import { CompaniesRepository } from '../../../companies/repositories/companies.repository.js';
import { UserResponseDto } from '../../dto/user-response.dto.js';
import { UsersRepository } from '../../repositories/users.repository.js';
import { CreateUserCommand } from '../impl/create-user.command.js';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly repo: UsersRepository,
    private readonly companies: CompaniesRepository,
    private readonly config: ConfigService,
  ) {}

  async execute({ dto }: CreateUserCommand) {
    const company = await this.companies.findById(dto.companyId);
    if (!company) throw new NotFoundException('Empresa não encontrada.');

    const name = dto.name.trim();
    const email = dto.email.trim();
    const existing = await this.repo.findByEmail(email);
    if (existing) {
      throw new ConflictException(
        existing.companyId === company.id
          ? 'Este e-mail já está cadastrado nesta empresa.'
          : 'Este e-mail já está cadastrado em outra empresa.',
      );
    }
    if ((await this.repo.countActive(company.id)) >= company.licenses) {
      throw new ConflictException('Não há vaga disponível.');
    }

    const passwordHash = await bcrypt.hash(
      this.config.get('DEFAULT_PASSWORD', 'botok123'),
      10,
    );
    const user = await this.repo.create({
      name,
      email,
      passwordHash,
      role: 'user',
      active: true,
      companyId: company.id,
    });
    return UserResponseDto.from(user);
  }
}
