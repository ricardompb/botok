import { AsyncLocalStorage } from 'node:async_hooks';
import type { EntityManager } from 'typeorm';

/**
 * Contexto de acesso a dados de cada operação:
 * - tenant: restrito a uma empresa cliente (usuário da empresa, ou admin
 *   operando explicitamente aquela empresa);
 * - platform: administração IT’s OK em visões gerais (todas as empresas);
 * - system: operações internas antes de haver usuário (login, seed).
 */
export type TenantContext =
  | { kind: 'tenant'; tenantId: number }
  | { kind: 'platform' }
  | { kind: 'system' };

export interface TenantStore {
  context: TenantContext;
  /** Ausente em rotas longas (streaming), até que uma transação curta seja aberta. */
  manager?: EntityManager;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();
