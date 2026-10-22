import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiErrorMessage } from '../../../shared/api/api-error';
import { tokenStorage, UNAUTHORIZED_EVENT } from '../../../shared/api/token-storage';
import { entraEnabled, forgetMicrosoftAccount, initEntra, signOutFromMicrosoft } from '../../../shared/auth/entra';
import type { AuthResponseDto, MeResponseDto } from '../dto/auth.dto';
import { authService } from '../services/auth.service';

interface AuthContextValue {
  user: MeResponseDto | null;
  /** Erro do retorno do login Microsoft, exibido na tela de entrada. */
  loginError: string;
  /** Login local (desenvolvimento). */
  signIn: (auth: AuthResponseDto) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Restaura a sessão existente ou conclui o retorno do login no Entra. */
async function restoreSession(): Promise<{ user: MeResponseDto | null; error: string }> {
  if (entraEnabled) {
    if (!(await initEntra())) return { user: null, error: '' };
    try {
      return { user: await authService.entraSession(), error: '' };
    } catch (err) {
      await forgetMicrosoftAccount();
      return { user: null, error: apiErrorMessage(err, 'Não foi possível entrar com a conta Microsoft.') };
    }
  }
  if (!tokenStorage.get()) return { user: null, error: '' };
  try {
    return { user: await authService.me(), error: '' };
  } catch {
    tokenStorage.clear();
    return { user: null, error: '' };
  }
}

let restoring: ReturnType<typeof restoreSession> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponseDto | null>(null);
  const [loginError, setLoginError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restoring ??= restoreSession();
    restoring.then(({ user, error }) => {
      setUser(user);
      setLoginError(error);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const signIn = useCallback((auth: AuthResponseDto) => {
    tokenStorage.set(auth.accessToken);
    setLoginError('');
    setUser(auth.user);
  }, []);

  const signOut = useCallback(() => {
    if (entraEnabled) {
      void signOutFromMicrosoft();
      return;
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loginError, signIn, signOut }), [user, loginError, signIn, signOut]);
  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider ausente.');
  return ctx;
}
