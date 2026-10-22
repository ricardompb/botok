#!/usr/bin/env bash
# Envia as variáveis de um arquivo .env para o Azure Key Vault (az login necessário).
# Uso: scripts/push-env-to-keyvault.sh <nome-do-cofre> [arquivo .env]
# DB_PASSWORD vira o segredo DB-PASSWORD. Variáveis de inicialização e valores vazios são ignorados.
set -euo pipefail

VAULT="${1:?Informe o nome do Key Vault}"
FILE="${2:-.env}"
SKIP=" AZURE_KEY_VAULT_URL AZURE_CLIENT_ID NODE_ENV PORT "

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" == \#* || "$line" != *=* ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  [[ -z "$value" || "$SKIP" == *" $key "* ]] && continue
  name="${key//_/-}"
  az keyvault secret set --vault-name "$VAULT" --name "$name" --value "$value" --output none
  echo "✓ $key → $name"
done < "$FILE"
