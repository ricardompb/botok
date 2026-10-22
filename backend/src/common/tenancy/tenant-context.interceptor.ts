import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, lastValueFrom } from 'rxjs';
import type { AuthUser } from '../auth/auth-user.js';
import { TenantAccessLog } from './tenant-access-log.entity.js';
import type { TenantContext } from './tenant-context.js';
import { TenantDb } from './tenant-db.js';
import { TENANT_PARAM_KEY } from './tenant-param.decorator.js';

/** Abre o contexto de tenant da requisição, a partir do usuário autenticado. */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: TenantDb,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const tenantParam = this.reflector.getAllAndOverride<string>(TENANT_PARAM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const { tenant, audit } = resolveContext(request.user, tenantParam, request.params);

    const operation = async () => {
      // Transação própria: o acesso fica registrado mesmo se a operação falhar.
      if (audit) {
        await this.db.run(tenant, async () => {
          await this.db.repo(TenantAccessLog).insert({
            ...audit,
            action: `${request.method} ${request.route?.path ?? request.path}`,
          });
        });
      }
      return this.db.run(tenant, () => lastValueFrom(next.handle(), { defaultValue: undefined }));
    };
    return from(operation());
  }
}

export function resolveContext(
  user: AuthUser | undefined,
  tenantParam: string | undefined,
  params: Record<string, string>,
): { tenant: TenantContext; audit?: Pick<TenantAccessLog, 'tenantId' | 'actorId' | 'actorEmail'> } {
  if (!user) return { tenant: { kind: 'system' } };
  if (user.role === 'user') {
    if (!user.tenantId) throw new BadRequestException('Usuário sem empresa vinculada.');
    return { tenant: { kind: 'tenant', tenantId: user.tenantId } };
  }
  if (!tenantParam) return { tenant: { kind: 'platform' } };
  const tenantId = Number(params[tenantParam]);
  if (!Number.isInteger(tenantId) || tenantId < 1) {
    throw new BadRequestException('Empresa inválida.');
  }
  return {
    tenant: { kind: 'tenant', tenantId },
    audit: { tenantId, actorId: user.id, actorEmail: user.email },
  };
}
