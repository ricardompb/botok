import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { tokenStorage, UNAUTHORIZED_EVENT } from '../../../shared/api/token-storage';
import type { AuthResponseDto, MeResponseDto } from '../dto/auth.dto';
import { authService } from '../services/auth.service';

interface AuthContextValue {
  user: MeResponseDto | null;
  signIn: (auth: AuthResponseDto) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponseDto | null>(null);
  const [ready, setReady] = useState(() => !tokenStorage.get());

  useEffect(() => {
    if (ready) return;
    authService
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setReady(true));
  }, [ready]);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const signIn = useCallback((auth: AuthResponseDto) => {
    tokenStorage.set(auth.accessToken);
    setUser(auth.user);
  }, []);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);
  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider ausente.');
  return ctx;
}
