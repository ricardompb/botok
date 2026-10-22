import type { User } from '../../users/entities/user.entity.js';
import type { EntraClaims } from './entra-claims.js';

export const NOT_REGISTERED =
  'Conta Microsoft não cadastrada no BOTOK. Procure a administração da sua empresa.';

/**
 * Decide se a identidade do Entra pode ser vinculada ao usuário do portal.
 * Administradores precisam vir do tenant da IT’s OK; usuários de empresa,
 * do tenant já vinculado à empresa (o primeiro acesso fixa esse tenant).
 */
export function entraLinkDenial(
  user: User | null,
  claims: EntraClaims,
  adminTenantId: string | undefined,
): string | null {
  if (claims.isGuest) {
    return 'Contas convidadas não são aceitas. Entre com a conta Microsoft da sua empresa.';
  }
  if (!user) return NOT_REGISTERED;
  if (user.entraObjectId && user.entraObjectId !== claims.objectId) return NOT_REGISTERED;
  if (user.role === 'admin') {
    return adminTenantId && adminTenantId === claims.tenantId ? null : NOT_REGISTERED;
  }
  const companyTenant = user.company?.entraTenantId;
  if (companyTenant && companyTenant !== claims.tenantId) return NOT_REGISTERED;
  return null;
}
