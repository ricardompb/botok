import type { User } from '../../users/entities/user.entity.js';
import type { EntraClaims } from './entra-claims.js';
import { entraLinkDenial, NOT_REGISTERED } from './entra-link-policy.js';

const ADMIN_TENANT = 'tenant-itsok';
const claims = (patch: Partial<EntraClaims> = {}): EntraClaims => ({
  tenantId: 'tenant-horizonte',
  objectId: 'oid-ana',
  username: 'ana@horizonte.example',
  name: 'Ana',
  isGuest: false,
  ...patch,
});
const user = (patch: Partial<User> = {}) =>
  ({ role: 'user', entraObjectId: null, company: { entraTenantId: null }, ...patch }) as User;

describe('entraLinkDenial', () => {
  it('vincula usuário cadastrado no primeiro acesso da empresa', () => {
    expect(entraLinkDenial(user(), claims(), ADMIN_TENANT)).toBeNull();
  });

  it('nega conta não cadastrada e conta convidada', () => {
    expect(entraLinkDenial(null, claims(), ADMIN_TENANT)).toBe(NOT_REGISTERED);
    expect(entraLinkDenial(user(), claims({ isGuest: true }), ADMIN_TENANT)).toMatch(/convidadas/);
  });

  it('exige o tenant já vinculado à empresa', () => {
    const u = user({ company: { entraTenantId: 'tenant-horizonte' } as User['company'] });
    expect(entraLinkDenial(u, claims(), ADMIN_TENANT)).toBeNull();
    expect(entraLinkDenial(u, claims({ tenantId: 'tenant-atacante' }), ADMIN_TENANT)).toBe(NOT_REGISTERED);
  });

  it('não troca a identidade já vinculada', () => {
    expect(entraLinkDenial(user({ entraObjectId: 'oid-ana' }), claims(), ADMIN_TENANT)).toBeNull();
    expect(entraLinkDenial(user({ entraObjectId: 'oid-ana' }), claims({ objectId: 'outro' }), ADMIN_TENANT)).toBe(
      NOT_REGISTERED,
    );
  });

  it('administrador só pelo tenant da IT’s OK', () => {
    const admin = user({ role: 'admin', company: null });
    expect(entraLinkDenial(admin, claims({ tenantId: ADMIN_TENANT }), ADMIN_TENANT)).toBeNull();
    expect(entraLinkDenial(admin, claims({ tenantId: 'tenant-cliente' }), ADMIN_TENANT)).toBe(NOT_REGISTERED);
    expect(entraLinkDenial(admin, claims({ tenantId: ADMIN_TENANT }), undefined)).toBe(NOT_REGISTERED);
  });
});
