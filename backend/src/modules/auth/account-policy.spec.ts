import type { User } from '../users/entities/user.entity.js';
import { accessDenial } from './account-policy.js';

const user = (patch: Partial<User>) =>
  ({ active: true, role: 'user', company: { until: '2999-12-31' }, ...patch }) as User;

describe('accessDenial', () => {
  it('libera usuário ativo com contrato vigente', () => {
    expect(accessDenial(user({}))).toBeNull();
  });

  it('bloqueia usuário suspenso', () => {
    expect(accessDenial(user({ active: false }))).toMatch(/suspenso/);
  });

  it('bloqueia contrato vencido', () => {
    expect(accessDenial(user({ company: { until: '2000-01-01' } as User['company'] }))).toMatch(
      /vigência/,
    );
  });

  it('administrador não depende de empresa', () => {
    expect(accessDenial(user({ role: 'admin', company: null }))).toBeNull();
  });
});
