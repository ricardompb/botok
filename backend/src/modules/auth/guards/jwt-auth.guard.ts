import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser, UserRole } from '../../../common/auth/auth-user.js';
import { IS_PUBLIC_KEY } from '../../../common/auth/public.decorator.js';
import { ROLES_KEY } from '../../../common/auth/roles.decorator.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { accessDenial } from '../account-policy.js';

/**
 * Guard global: autentica pelo token Bearer, revalida a conta a cada
 * requisição (suspensão e vigência) e aplica o perfil exigido por @Roles.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly users: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);
    const request = context.switchToHttp().getRequest();

    const user = await this.resolveUser(request.headers.authorization);
    if (user) request.user = user;
    if (isPublic) return true;
    if (!user) throw new UnauthorizedException('Sessão expirada. Entre novamente.');

    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, targets);
    if (roles?.length && !roles.includes(user.role)) {
      throw new ForbiddenException('Acesso restrito ao perfil autorizado.');
    }
    return true;
  }

  private async resolveUser(header?: string): Promise<AuthUser | null> {
    const [type, token] = header?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) return null;
    let sub: string;
    try {
      ({ sub } = await this.jwt.verifyAsync<{ sub: string }>(token));
    } catch {
      return null;
    }
    const user = await this.users.findById(sub);
    if (!user) return null;
    const denial = accessDenial(user);
    if (denial) throw new ForbiddenException(denial);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };
  }
}
