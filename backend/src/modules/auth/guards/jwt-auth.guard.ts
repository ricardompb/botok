import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser, UserRole } from '../../../common/auth/auth-user.js';
import { IS_PUBLIC_KEY } from '../../../common/auth/public.decorator.js';
import { ROLES_KEY } from '../../../common/auth/roles.decorator.js';
import { TenantDb } from '../../../common/tenancy/tenant-db.js';
import type { User } from '../../users/entities/user.entity.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { accessDenial } from '../account-policy.js';
import { AUTH_OPTIONS, type AuthOptions } from '../auth-options.js';

/**
 * Guard global: autentica pelo token Bearer — access token do Microsoft
 * Entra ID ou, só em desenvolvimento, o token do login local —, revalida a
 * conta a cada requisição (suspensão e vigência) e aplica o perfil de @Roles.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly users: UsersRepository,
    private readonly db: TenantDb,
    @Inject(AUTH_OPTIONS) private readonly options: AuthOptions,
  ) {}

  async canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);
    const request = context.switchToHttp().getRequest();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const user = type === 'Bearer' && token ? await this.resolveUser(token, request) : null;
    if (user) request.user = user;
    if (isPublic) return true;
    if (!user) throw new UnauthorizedException('Sessão expirada. Entre novamente.');

    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, targets);
    if (roles?.length && !roles.includes(user.role)) {
      throw new ForbiddenException('Acesso restrito ao perfil autorizado.');
    }
    return true;
  }

  private async resolveUser(token: string, request: { entraClaims?: unknown }) {
    if (this.options.localEnabled) {
      const sub = await this.jwt
        .verifyAsync<{ sub: string }>(token)
        .then((p) => p.sub)
        .catch(() => null);
      if (sub) return this.toAuthUser(await this.lookup(() => this.users.findById(sub)));
    }
    const claims = await this.options.entra?.verify(token);
    if (!claims) return null;
    // Disponível para POST /auth/entra/session, que faz o vínculo no primeiro acesso.
    request.entraClaims = claims;
    return this.toAuthUser(
      await this.lookup(() => this.users.findByEntraIdentity(claims.tenantId, claims.objectId)),
    );
  }

  /** Identificar o usuário precede o tenant: busca em contexto de sistema. */
  private lookup(fn: () => Promise<User | null>) {
    return this.db.run({ kind: 'system' }, fn);
  }

  private toAuthUser(user: User | null): AuthUser | null {
    if (!user) return null;
    const denial = accessDenial(user);
    if (denial) throw new ForbiddenException(denial);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
