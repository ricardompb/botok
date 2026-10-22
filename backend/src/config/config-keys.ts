/**
 * Variáveis de configuração do backend. Com AZURE_KEY_VAULT_URL definido,
 * todas vêm do Azure Key Vault (segredo `DB_PASSWORD` → `DB-PASSWORD`).
 */
export const CONFIG_KEYS: { key: string; requiredInProduction: boolean }[] = [
  { key: 'DB_HOST', requiredInProduction: true },
  { key: 'DB_PORT', requiredInProduction: false },
  { key: 'DB_USER', requiredInProduction: true },
  { key: 'DB_PASSWORD', requiredInProduction: true },
  { key: 'DB_NAME', requiredInProduction: true },
  { key: 'CORS_ORIGIN', requiredInProduction: false },
  { key: 'JWT_SECRET', requiredInProduction: true },
  { key: 'JWT_EXPIRES_IN', requiredInProduction: false },
  { key: 'DEFAULT_PASSWORD', requiredInProduction: false },
  { key: 'AUTH_LOCAL_ENABLED', requiredInProduction: false },
  { key: 'ENTRA_API_CLIENT_ID', requiredInProduction: true },
  { key: 'ENTRA_API_SCOPE', requiredInProduction: false },
  { key: 'ENTRA_ADMIN_TENANT_ID', requiredInProduction: true },
  { key: 'ENTRA_JWKS_URI', requiredInProduction: false },
  { key: 'FOUNDRY_PROJECT_ENDPOINT', requiredInProduction: false },
  { key: 'SWAGGER_ENABLED', requiredInProduction: false },
];

/**
 * Lidas do ambiente da plataforma, nunca do cofre: são necessárias para
 * chegar até ele (URL, identidade gerenciada) ou definidas pela hospedagem.
 */
export const BOOTSTRAP_KEYS = ['AZURE_KEY_VAULT_URL', 'AZURE_CLIENT_ID', 'NODE_ENV', 'PORT'];
