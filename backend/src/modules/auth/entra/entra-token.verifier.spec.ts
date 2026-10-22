import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTPayload } from 'jose';
import { EntraTokenVerifier } from './entra-token.verifier.js';

const AUDIENCE = '11111111-1111-1111-1111-111111111111';
const TID = '22222222-2222-2222-2222-222222222222';
const OID = '33333333-3333-3333-3333-333333333333';
const ISS = `https://login.microsoftonline.com/${TID}/v2.0`;

describe('EntraTokenVerifier', () => {
  let sign: (claims: JWTPayload, opts?: { audience?: string; expired?: boolean; foreignKey?: boolean }) => Promise<string>;
  let verifier: EntraTokenVerifier;

  beforeAll(async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    const other = await generateKeyPair('RS256');
    const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256' };
    verifier = new EntraTokenVerifier({
      audience: AUDIENCE,
      scope: 'access_as_user',
      keys: createLocalJWKSet({ keys: [jwk] }),
    });
    sign = (claims, opts = {}) =>
      new SignJWT({ iss: ISS, tid: TID, oid: OID, scp: 'access_as_user', preferred_username: 'ana@horizonte.example', name: 'Ana Ribeiro', ...claims })
        .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
        .setAudience(opts.audience ?? AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(opts.expired ? Math.floor(Date.now() / 1000) - 60 : '1h')
        .sign(opts.foreignKey ? other.privateKey : privateKey);
  });

  it('aceita token válido e extrai a identidade', async () => {
    expect(await verifier.verify(await sign({}))).toEqual({
      tenantId: TID,
      objectId: OID,
      username: 'ana@horizonte.example',
      name: 'Ana Ribeiro',
      isGuest: false,
    });
  });

  it('rejeita assinatura, audience e expiração inválidas', async () => {
    expect(await verifier.verify(await sign({}, { foreignKey: true }))).toBeNull();
    expect(await verifier.verify(await sign({}, { audience: 'outra-api' }))).toBeNull();
    expect(await verifier.verify(await sign({}, { expired: true }))).toBeNull();
  });

  it('rejeita emissor de outro tenant, escopo ausente e conta pessoal', async () => {
    expect(await verifier.verify(await sign({ iss: 'https://login.microsoftonline.com/outro/v2.0' }))).toBeNull();
    expect(await verifier.verify(await sign({ scp: 'User.Read' }))).toBeNull();
    const consumers = '9188040d-6c67-4c5b-b112-36a304b66dad';
    expect(
      await verifier.verify(await sign({ tid: consumers, iss: `https://login.microsoftonline.com/${consumers}/v2.0` })),
    ).toBeNull();
  });

  it('rejeita tid/oid fora do formato UUID', async () => {
    expect(await verifier.verify(await sign({ oid: 'nao-uuid' }))).toBeNull();
  });

  it('identifica conta convidada pelo idp', async () => {
    const claims = await verifier.verify(await sign({ idp: 'https://sts.windows.net/outro-tenant/' }));
    expect(claims?.isGuest).toBe(true);
  });
});
