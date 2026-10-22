import { ForbiddenException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompaniesRepository } from '../../../companies/repositories/companies.repository.js';
import { UsersRepository } from '../../../users/repositories/users.repository.js';
import { accessDenial } from '../../account-policy.js';
import { AUTH_OPTIONS, type AuthOptions } from '../../auth-options.js';
import { MeResponseDto } from '../../dto/auth-response.dto.js';
import { entraLinkDenial } from '../../entra/entra-link-policy.js';
import { StartEntraSessionCommand } from '../impl/start-entra-session.command.js';

/**
 * Início de sessão após o login na Microsoft. No primeiro acesso, vincula a
 * identidade do Entra (tid + oid) ao usuário cadastrado pela administração.
 */
@CommandHandler(StartEntraSessionCommand)
export class StartEntraSessionHandler implements ICommandHandler<StartEntraSessionCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly companies: CompaniesRepository,
    @Inject(AUTH_OPTIONS) private readonly options: AuthOptions,
  ) {}

  async execute({ claims }: StartEntraSessionCommand) {
    const user =
      (await this.users.findByEntraIdentity(claims.tenantId, claims.objectId)) ??
      (claims.username ? await this.users.findByEmail(claims.username) : null);

    const denial =
      entraLinkDenial(user, claims, this.options.adminTenantId) ?? (user && accessDenial(user));
    if (!user || denial) throw new ForbiddenException(denial);

    if (user.company && !user.company.entraTenantId) {
      user.company.entraTenantId = claims.tenantId;
      await this.companies.save(user.company);
    }
    user.entraTenantId = claims.tenantId;
    user.entraObjectId = claims.objectId;
    user.lastAccessAt = new Date();
    await this.users.save(user);
    return MeResponseDto.from(user);
  }
}
