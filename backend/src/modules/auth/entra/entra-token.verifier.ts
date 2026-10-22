import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import type { EntraClaims } from './entra-claims.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Tenant das contas pessoais da Microsoft, que não são aceitas. */
const CONSUMERS_TENANT = '9188040d-6c67-4c5b-b112-36a304b66dad';

export interface EntraVerifierOptions {
  /** Client ID do app registration da API (audience dos tokens v2). */
  audience: string;
  /** Escopo delegado exigido, ex.: access_as_user. */
  scope: string;
  keys: JWTVerifyGetKey;
}

/**
 * Valida access tokens v2 multi-tenant: assinatura (JWKS da Microsoft),
 * audience, emissor coerente com o tenant do token, expiração e escopo.
 */
export class EntraTokenVerifier {
  constructor(private readonly options: EntraVerifierOptions) {}

  static remote(audience: string, scope: string, jwksUri: string) {
    return new EntraTokenVerifier({ audience, scope, keys: createRemoteJWKSet(new URL(jwksUri)) });
  }

  async verify(token: string): Promise<EntraClaims | null> {
    try {
      const { payload } = await jwtVerify(token, this.options.keys, {
        audience: this.options.audience,
        algorithms: ['RS256'],
      });
      const tid = String(payload.tid ?? '');
      const oid = String(payload.oid ?? '');
      const scopes = String(payload.scp ?? '').split(' ');
      if (!UUID.test(tid) || !UUID.test(oid) || tid === CONSUMERS_TENANT) return null;
      if (payload.iss !== `https://login.microsoftonline.com/${tid}/v2.0`) return null;
      if (!scopes.includes(this.options.scope)) return null;
      return {
        tenantId: tid,
        objectId: oid,
        username: String(payload.preferred_username ?? ''),
        name: String(payload.name ?? ''),
        isGuest: !!payload.idp && payload.idp !== payload.iss,
      };
    } catch {
      return null;
    }
  }
}
