import { PublicClientApplication, type AccountInfo } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID as string | undefined;
const scopes = [import.meta.env.VITE_ENTRA_API_SCOPE as string];

/** Sem VITE_ENTRA_CLIENT_ID o app usa o login local de desenvolvimento. */
export const entraEnabled = !!clientId;

const msal = entraEnabled
  ? new PublicClientApplication({
      auth: {
        clientId: clientId!,
        // Multi-tenant: contas corporativas de qualquer organização.
        authority: import.meta.env.VITE_ENTRA_AUTHORITY || 'https://login.microsoftonline.com/organizations',
        redirectUri: window.location.origin + '/',
        postLogoutRedirectUri: window.location.origin + '/entrada',
      },
      cache: { cacheLocation: 'sessionStorage' },
    })
  : null;

let started: Promise<AccountInfo | null> | null = null;

/** Inicializa o MSAL e conclui o retorno do login, se houver. Executa uma única vez. */
export function initEntra(): Promise<AccountInfo | null> {
  started ??= (async () => {
    if (!msal) return null;
    await msal.initialize();
    const result = await msal.handleRedirectPromise();
    const account = result?.account ?? msal.getAllAccounts()[0] ?? null;
    msal.setActiveAccount(account);
    return account;
  })();
  return started;
}

export function signInWithMicrosoft(loginHint: string) {
  return msal!.loginRedirect({ scopes, loginHint: loginHint || undefined, redirectStartPage: window.location.origin + '/' });
}

/** Access token da API; null quando é preciso entrar novamente. */
export async function entraAccessToken(): Promise<string | null> {
  const account = msal?.getActiveAccount();
  if (!msal || !account) return null;
  try {
    return (await msal.acquireTokenSilent({ scopes, account })).accessToken;
  } catch {
    return null;
  }
}

export function entraAccountKey(): string | null {
  return msal?.getActiveAccount()?.homeAccountId ?? null;
}

/** Encerra a sessão também na Microsoft e volta para /entrada. */
export function signOutFromMicrosoft() {
  return msal!.logoutRedirect({ account: msal!.getActiveAccount() ?? undefined });
}

/** Esquece a conta só neste navegador (ex.: conta Microsoft sem cadastro no portal). */
export async function forgetMicrosoftAccount() {
  msal?.setActiveAccount(null);
  await msal?.clearCache();
}
