import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { Logger } from '@nestjs/common';
import { DefaultAzureCredential } from '@azure/identity';
import { CONFIG_KEYS } from './config-keys.js';
import { KeyVaultSecretReader, readFromKeyVault, type SecretReader } from './key-vault.js';

const logger = new Logger('Configuração');

/**
 * Carrega a configuração em process.env antes de a aplicação ser montada.
 * - AZURE_KEY_VAULT_URL definido: as variáveis vêm do Azure Key Vault e
 *   prevalecem sobre o ambiente e o .env.
 * - Produção: o Key Vault é obrigatório e o .env nunca é lido.
 * - Desenvolvimento sem Key Vault: usa o .env.
 */
export async function loadConfiguration(
  env: NodeJS.ProcessEnv = process.env,
  reader?: (vaultUrl: string) => SecretReader,
) {
  const production = env.NODE_ENV === 'production';
  if (!production && existsSync('.env')) {
    // O .env não sobrescreve variáveis já definidas no ambiente.
    for (const [key, value] of Object.entries(parseEnv(readFileSync('.env', 'utf8')))) env[key] ??= value;
  }

  const vaultUrl = env.AZURE_KEY_VAULT_URL;
  if (production && !vaultUrl) {
    throw new Error('AZURE_KEY_VAULT_URL é obrigatório em produção: a configuração vem do Azure Key Vault.');
  }

  if (vaultUrl) {
    const secrets = await readFromKeyVault(
      reader?.(vaultUrl) ?? new KeyVaultSecretReader(vaultUrl, new DefaultAzureCredential()),
      CONFIG_KEYS.map((c) => c.key),
    );
    Object.assign(env, secrets);
    // Apenas os nomes, nunca os valores.
    logger.log(`${Object.keys(secrets).length} variáveis carregadas do Key Vault ${new URL(vaultUrl).host}.`);
  }

  if (production) {
    const missing = CONFIG_KEYS.filter((c) => c.requiredInProduction && !env[c.key]).map((c) => c.key);
    if (missing.length) throw new Error(`Configuração ausente no Key Vault: ${missing.join(', ')}.`);
  }
}
