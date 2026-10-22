import type { UserRole } from '../modules/auth/dto/auth.dto';

export type PageKey = 'login' | 'catalog' | 'chat' | 'admin' | 'company' | 'agents' | 'brief';

export const paths = {
  login: '/entrada',
  catalog: '/assistentes',
  chat: (agentId: string) => `/assistentes/${agentId}`,
  admin: '/administracao',
  company: (id: number) => `/administracao/empresas/${id}`,
  agents: '/administracao/agentes',
  brief: '/sobre',
};

/** Página inicial de cada perfil. */
export function homePath(role?: UserRole): string {
  if (role === 'admin') return paths.admin;
  if (role === 'user') return paths.catalog;
  return paths.login;
}
