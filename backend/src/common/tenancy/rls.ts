import type { EntityManager } from 'typeorm';

/** Tabelas com dados de uma empresa e a coluna que identifica o tenant. */
const TENANT_TABLES: [table: string, column: string][] = [
  ['companies', 'id'],
  ['users', '"tenantId"'],
  ['company_agents', '"tenantId"'],
  ['chat_sessions', '"tenantId"'],
  ['support_requests', '"tenantId"'],
  ['tenant_access_log', '"tenantId"'],
];

/**
 * Políticas de Row-Level Security (idempotentes). FORCE faz valer também para
 * o dono das tabelas, que é o próprio usuário da aplicação.
 */
export async function applyRowLevelSecurity(manager: EntityManager) {
  await manager.query(`
    CREATE OR REPLACE FUNCTION app_bypass_rls() RETURNS boolean
      LANGUAGE sql STABLE AS $$ SELECT coalesce(current_setting('app.bypass_rls', true), '') = 'on' $$;
    CREATE OR REPLACE FUNCTION app_tenant_id() RETURNS int
      LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.tenant_id', true), '')::int $$;
  `);

  for (const [table, column] of TENANT_TABLES) {
    await protect(manager, table, [
      `CREATE POLICY tenant_isolation ON ${table}
         USING (app_bypass_rls() OR ${column} = app_tenant_id())
         WITH CHECK (app_bypass_rls() OR ${column} = app_tenant_id())`,
    ]);
  }

  // Catálogo: genéricos (sem tenant) visíveis a todos; exclusivos só à empresa
  // destinatária. Alterações apenas pela plataforma.
  await protect(manager, 'agents', [
    `CREATE POLICY catalog_read ON agents FOR SELECT
       USING (app_bypass_rls() OR "tenantId" IS NULL OR "tenantId" = app_tenant_id())`,
    `CREATE POLICY catalog_write ON agents FOR ALL
       USING (app_bypass_rls()) WITH CHECK (app_bypass_rls())`,
  ]);

  // Registro de alterações do catálogo: exclusivo da plataforma.
  await protect(manager, 'agent_audit', [
    `CREATE POLICY platform_only ON agent_audit USING (app_bypass_rls()) WITH CHECK (app_bypass_rls())`,
  ]);
}

async function protect(manager: EntityManager, table: string, policies: string[]) {
  const existing: { policyname: string }[] = await manager.query(
    `SELECT policyname FROM pg_policies WHERE tablename = $1`,
    [table],
  );
  for (const { policyname } of existing) {
    await manager.query(`DROP POLICY "${policyname}" ON ${table}`);
  }
  await manager.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
  await manager.query(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`);
  for (const policy of policies) await manager.query(policy);
}
