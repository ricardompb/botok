export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Empresa (tenant) do usuário; null para a administração IT’s OK. */
  tenantId: number | null;
}
