import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource, type EntityTarget, type ObjectLiteral, type Repository } from 'typeorm';
import { tenantStorage, type TenantContext } from './tenant-context.js';

/**
 * Único acesso ao banco da aplicação. Cada operação roda em uma transação
 * com `app.tenant_id` / `app.bypass_rls` definidos, que as políticas de
 * Row-Level Security do PostgreSQL usam para isolar os tenants.
 */
@Injectable()
export class TenantDb {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Abre uma transação no contexto informado. Todas as consultas usam a mesma
   * conexão: execute-as em sequência (sem Promise.all).
   */
  run<T>(context: TenantContext, fn: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const tenantId = context.kind === 'tenant' ? String(context.tenantId) : '';
      const bypass = context.kind === 'tenant' ? 'off' : 'on';
      await manager.query(
        `SELECT set_config('app.tenant_id', $1, true), set_config('app.bypass_rls', $2, true)`,
        [tenantId, bypass],
      );
      return tenantStorage.run({ context, manager }, fn);
    });
  }

  /**
   * Define o contexto sem abrir transação — para operações longas, que
   * acessam o banco apenas em transações curtas via `transaction()`.
   */
  enter<T>(context: TenantContext, fn: () => Promise<T>): Promise<T> {
    return tenantStorage.run({ context }, fn);
  }

  /** Transação curta no contexto atual. */
  transaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.run(this.context, fn);
  }

  get context(): TenantContext {
    return this.store().context;
  }

  repo<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
    const { manager } = this.store();
    if (!manager) throw new Error('Acesso ao banco fora de uma transação (use TenantDb.transaction).');
    return manager.getRepository(entity);
  }

  /** Tenant do contexto atual, ou null em contexto de plataforma/sistema. */
  get tenantId(): number | null {
    const ctx = this.context;
    return ctx.kind === 'tenant' ? ctx.tenantId : null;
  }

  /**
   * Filtro de aplicação (além do RLS): em contexto de tenant, restringe ao
   * tenant atual e recusa pedidos explícitos de outro tenant.
   */
  scope(requested?: number | null): { tenantId?: number } {
    const current = this.tenantId;
    if (current === null) return requested == null ? {} : { tenantId: requested };
    if (requested != null && requested !== current) {
      throw new ForbiddenException('Acesso a dados de outra empresa não permitido.');
    }
    return { tenantId: current };
  }

  private store() {
    const store = tenantStorage.getStore();
    if (!store) throw new Error('Acesso ao banco fora de um contexto de tenant.');
    return store;
  }
}
