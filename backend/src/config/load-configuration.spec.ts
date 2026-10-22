import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFromKeyVault, secretNameFor, type SecretReader } from './key-vault.js';
import { loadConfiguration } from './load-configuration.js';

/** Cofre em memória, com nomes de segredo no formato do Key Vault. */
const vault = (secrets: Record<string, string>, fail?: string): SecretReader & { asked: string[] } => {
  const asked: string[] = [];
  return {
    asked,
    get: async (name) => {
      asked.push(name);
      if (name === fail) throw new Error('Forbidden');
      return secrets[name];
    },
  };
};

const PROD_SECRETS = {
  'DB-HOST': 'db.interno',
  'DB-USER': 'botok_app',
  'DB-PASSWORD': 'senha-do-cofre',
  'DB-NAME': 'botok',
  'JWT-SECRET': 'jwt-do-cofre',
  'ENTRA-API-CLIENT-ID': 'api-id',
  'ENTRA-ADMIN-TENANT-ID': 'tenant-itsok',
};

describe('configuração via Azure Key Vault', () => {
  const cwd = process.cwd();
  beforeEach(() => {
    const dir = mkdtempSync(join(tmpdir(), 'botok-cfg-'));
    writeFileSync(join(dir, '.env'), 'DB_PASSWORD=senha-do-env\nPORT=3000\n');
    process.chdir(dir);
  });
  afterEach(() => process.chdir(cwd));

  it('converte o nome da variável para o formato do Key Vault', () => {
    expect(secretNameFor('ENTRA_ADMIN_TENANT_ID')).toBe('ENTRA-ADMIN-TENANT-ID');
  });

  it('ignora segredos ausentes e falha em erros de acesso', async () => {
    expect(await readFromKeyVault(vault({ 'DB-HOST': 'h' }), ['DB_HOST', 'DB_PORT'])).toEqual({ DB_HOST: 'h' });
    await expect(readFromKeyVault(vault({}, 'DB-PASSWORD'), ['DB_PASSWORD'])).rejects.toThrow(
      'Falha ao ler o segredo DB-PASSWORD do Key Vault: Forbidden',
    );
  });

  it('desenvolvimento sem cofre: usa o .env sem sobrescrever o ambiente', async () => {
    const env: NodeJS.ProcessEnv = { PORT: '3002' };
    await loadConfiguration(env);
    expect(env).toMatchObject({ DB_PASSWORD: 'senha-do-env', PORT: '3002' });
  });

  it('com cofre: os valores do Key Vault prevalecem sobre o .env', async () => {
    const reader = vault({ 'DB-PASSWORD': 'senha-do-cofre' });
    const env: NodeJS.ProcessEnv = { AZURE_KEY_VAULT_URL: 'https://botok.vault.azure.net' };
    await loadConfiguration(env, () => reader);
    expect(env.DB_PASSWORD).toBe('senha-do-cofre');
    expect(reader.asked).not.toContain('AZURE-KEY-VAULT-URL');
  });

  it('produção: exige o cofre, ignora o .env e valida as obrigatórias', async () => {
    await expect(loadConfiguration({ NODE_ENV: 'production' })).rejects.toThrow('AZURE_KEY_VAULT_URL é obrigatório');

    const incomplete: NodeJS.ProcessEnv = { NODE_ENV: 'production', AZURE_KEY_VAULT_URL: 'https://botok.vault.azure.net' };
    await expect(loadConfiguration(incomplete, () => vault({ 'DB-HOST': 'h' }))).rejects.toThrow(
      'Configuração ausente no Key Vault: DB_USER, DB_PASSWORD',
    );
    expect(incomplete.DB_PASSWORD).toBeUndefined();

    const env: NodeJS.ProcessEnv = { NODE_ENV: 'production', AZURE_KEY_VAULT_URL: 'https://botok.vault.azure.net' };
    await loadConfiguration(env, () => vault(PROD_SECRETS));
    expect(env).toMatchObject({ DB_PASSWORD: 'senha-do-cofre', JWT_SECRET: 'jwt-do-cofre' });
    expect(env.PORT).toBeUndefined();
  });
});
