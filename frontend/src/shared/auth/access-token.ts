import { tokenStorage } from '../api/token-storage';
import { entraAccessToken, entraAccountKey, entraEnabled } from './entra';

/** Token Bearer da sessão atual: Entra ID ou, em desenvolvimento, o login local. */
export function getAccessToken(): Promise<string | null> {
  return entraEnabled ? entraAccessToken() : Promise.resolve(tokenStorage.get());
}

/** Identifica a sessão atual (para caches por usuário). */
export function sessionKey(): string | null {
  return entraEnabled ? entraAccountKey() : tokenStorage.get();
}
