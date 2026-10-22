import type { TokenCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

/** Nome do segredo no Key Vault (só aceita letras, números e hífen). */
export function secretNameFor(key: string) {
  return key.replaceAll('_', '-');
}

export interface SecretReader {
  /** Valor do segredo, ou undefined se ele não existir no cofre. */
  get(name: string): Promise<string | undefined>;
}

export class KeyVaultSecretReader implements SecretReader {
  private readonly client: SecretClient;

  constructor(vaultUrl: string, credential: TokenCredential) {
    this.client = new SecretClient(vaultUrl, credential);
  }

  async get(name: string) {
    try {
      return (await this.client.getSecret(name)).value;
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode === 404) return undefined;
      throw err;
    }
  }
}

/**
 * Lê as variáveis do cofre. Segredos ausentes são ignorados; qualquer outra
 * falha (permissão, rede) interrompe a inicialização — sem cair para o .env.
 */
export async function readFromKeyVault(reader: SecretReader, keys: string[]) {
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        return [key, await reader.get(secretNameFor(key))] as const;
      } catch (err) {
        throw new Error(`Falha ao ler o segredo ${secretNameFor(key)} do Key Vault: ${(err as Error).message}`);
      }
    }),
  );
  return Object.fromEntries(entries.filter(([, value]) => value !== undefined)) as Record<string, string>;
}
