-- Usuário da aplicação: sem SUPERUSER e sem BYPASSRLS, para que o
-- Row-Level Security do PostgreSQL seja sempre aplicado ao backend.
-- Troque a senha fora do ambiente de desenvolvimento.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'itsok_app') THEN
    CREATE ROLE itsok_app LOGIN PASSWORD 'itsok_app' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT CONNECT ON DATABASE itsok TO itsok_app;
GRANT USAGE, CREATE ON SCHEMA public TO itsok_app;
