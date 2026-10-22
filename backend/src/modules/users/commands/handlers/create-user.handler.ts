import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { CompaniesRepository } from '../../../companies/repositories/companies.repository.js';
import { UserResponseDto } from '../../dto/user-response.dto.js';
import { UsersRepository } from '../../repositories/users.repository.js';
import { CreateUserCommand } from '../impl/create-user.command.js';

const UNIQUE_VIOLATION = '23505';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly repo: UsersRepository,
    private readonly companies: CompaniesRepository,
    private readonly config: ConfigService,
  ) {}

  async execute({ tenantId, dto }: CreateUserCommand) {
    const company = await this.companies.findById(tenantId);
    if (!company) throw new NotFoundException('Empresa não encontrada.');

    const name = dto.name.trim();
    const email = dto.email.trim();
    if (await this.repo.findByEmail(email)) {
      throw new ConflictException('Este e-mail já está cadastrado nesta empresa.');
    }
    if ((await this.repo.countActive(company.id)) >= company.licenses) {
      throw new ConflictException('Não há vaga disponível.');
    }

    const passwordHash = await bcrypt.hash(this.config.get('DEFAULT_PASSWORD', 'itsok123'), 10);
    try {
      const user = await this.repo.create({
        name,
        email,
        passwordHash,
        role: 'user',
        active: true,
        tenantId: company.id,
      });
      return UserResponseDto.from(user);
    } catch (err) {
      // O e-mail é único na plataforma; outras empresas não são visíveis neste tenant.
      if (err instanceof QueryFailedError && (err.driverError as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new ConflictException('Este e-mail já está cadastrado em outra empresa.');
      }
      throw err;
    }
  }
}
