-- Usuário da aplicação: sem SUPERUSER e sem BYPASSRLS, para que o
-- Row-Level Security do PostgreSQL seja sempre aplicado ao backend.
-- Troque a senha fora do ambiente de desenvolvimento.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'botok_app') THEN
    CREATE ROLE botok_app LOGIN PASSWORD 'botok_app' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT CONNECT ON DATABASE botok TO botok_app;
GRANT USAGE, CREATE ON SCHEMA public TO botok_app;
