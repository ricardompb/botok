import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../modules/auth/dto/auth.dto';
import { useAuth } from '../modules/auth/hooks/use-auth';
import { homePath, paths } from './paths';

/** Restringe a rota ao perfil; o backend aplica a mesma regra. */
export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={paths.login} replace />;
  if (user.role !== role) return <Navigate to={homePath(user.role)} replace />;
  return children;
}

export function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={homePath(user?.role)} replace />;
}
