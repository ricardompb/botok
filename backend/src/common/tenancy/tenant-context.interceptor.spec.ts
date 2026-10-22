import type { AuthUser } from '../auth/auth-user.js';
import { resolveContext } from './tenant-context.interceptor.js';

const user = (patch: Partial<AuthUser>): AuthUser => ({
  id: 'u1',
  name: 'N',
  email: 'n@x.example',
  role: 'user',
  tenantId: 1,
  ...patch,
});

describe('resolveContext', () => {
  it('sem usuário: contexto de sistema (login, Fale conosco anônimo)', () => {
    expect(resolveContext(undefined, undefined, {})).toEqual({ tenant: { kind: 'system' } });
  });

  it('usuário de empresa: sempre o próprio tenant, ignorando parâmetros', () => {
    expect(resolveContext(user({}), 'companyId', { companyId: '2' })).toEqual({
      tenant: { kind: 'tenant', tenantId: 1 },
    });
  });

  it('admin em visão geral: plataforma, sem auditoria', () => {
    expect(resolveContext(user({ role: 'admin', tenantId: null }), undefined, {})).toEqual({
      tenant: { kind: 'platform' },
    });
  });

  it('admin em rota de empresa: tenant explícito e auditado', () => {
    const admin = user({ role: 'admin', tenantId: null, id: 'a1', email: 'equipe@itsok.example' });
    expect(resolveContext(admin, 'companyId', { companyId: '2' })).toEqual({
      tenant: { kind: 'tenant', tenantId: 2 },
      audit: { tenantId: 2, actorId: 'a1', actorEmail: 'equipe@itsok.example' },
    });
    expect(() => resolveContext(admin, 'companyId', { companyId: 'abc' })).toThrow('Empresa inválida.');
  });
});
