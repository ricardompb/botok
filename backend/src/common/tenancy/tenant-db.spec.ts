import type { DataSource } from 'typeorm';
import { tenantStorage, type TenantContext } from './tenant-context.js';
import { TenantDb } from './tenant-db.js';

const db = new TenantDb({} as DataSource);
const within = <T>(context: TenantContext, fn: () => T) =>
  tenantStorage.run({ context, manager: {} as never }, fn);

describe('TenantDb.scope', () => {
  it('fora de contexto, recusa qualquer acesso ao banco', () => {
    expect(() => db.scope()).toThrow('fora de um contexto de tenant');
  });

  it('no tenant, filtra pelo próprio tenant e recusa outro', () => {
    within({ kind: 'tenant', tenantId: 1 }, () => {
      expect(db.scope()).toEqual({ tenantId: 1 });
      expect(db.scope(1)).toEqual({ tenantId: 1 });
      expect(() => db.scope(2)).toThrow('outra empresa');
    });
  });

  it('na plataforma, sem filtro ou com o tenant pedido', () => {
    within({ kind: 'platform' }, () => {
      expect(db.scope()).toEqual({});
      expect(db.scope(2)).toEqual({ tenantId: 2 });
    });
  });
});
