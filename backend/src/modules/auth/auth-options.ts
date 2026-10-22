import { ConfigService } from '@nestjs/config';
import { EntraTokenVerifier } from './entra/entra-token.verifier.js';

export const AUTH_OPTIONS = Symbol('AUTH_OPTIONS');

export interface AuthOptions {
  /** Login por e-mail/senha — apenas para desenvolvimento. */
  localEnabled: boolean;
  entra: EntraTokenVerifier | null;
  adminTenantId: string | undefined;
}

export function authOptionsFactory(config: ConfigService): AuthOptions {
  const localEnabled = config.get('AUTH_LOCAL_ENABLED') === 'true';
  if (localEnabled && config.get('NODE_ENV') === 'production') {
    throw new Error('AUTH_LOCAL_ENABLED não pode ser usado em produção.');
  }
  const audience = config.get<string>('ENTRA_API_CLIENT_ID');
  const entra = audience
    ? EntraTokenVerifier.remote(
        audience,
        config.get('ENTRA_API_SCOPE', 'access_as_user'),
        config.get(
          'ENTRA_JWKS_URI',
          'https://login.microsoftonline.com/common/discovery/v2.0/keys',
        ),
      )
    : null;
  if (!localEnabled && !entra) {
    throw new Error('Configure ENTRA_API_CLIENT_ID ou habilite AUTH_LOCAL_ENABLED em desenvolvimento.');
  }
  return { localEnabled, entra, adminTenantId: config.get('ENTRA_ADMIN_TENANT_ID') || undefined };
}
