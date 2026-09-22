const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('[admin-panel] DATABASE_URL is not configured; skipping Prisma migrations for this preview build.');
  process.exit(0);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const migrationsPath = path.join(__dirname, '..', 'prisma', 'migrations');

function runPrisma(args) {
  return spawnSync(command, ['prisma', ...args], {
    stdio: 'inherit',
    env: process.env,
  });
}

async function baselineExistingDatabase() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);
    const tableNames = tables.rows.map((row) => row.table_name);
    const migrations = fs
      .readdirSync(migrationsPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    const baselineMigrations = migrations.filter((migration) => !migration.startsWith('20260922_'));
    const pendingMigrations = migrations.filter((migration) => migration.startsWith('20260922_'));
    if (!tableNames.includes('_prisma_migrations') && tableNames.length > 0) {
      console.log(`[admin-panel] Existing database detected; baselining ${baselineMigrations.length} historical migrations.`);
      for (const migration of baselineMigrations) {
        const result = runPrisma(['migrate', 'resolve', '--applied', migration]);
        if (result.status !== 0) process.exit(result.status ?? 1);
      }
      console.log(`[admin-panel] New migrations will be applied normally: ${pendingMigrations.join(', ')}`);
    }

    if (tableNames.includes('_prisma_migrations')) {
      const failed = await client.query(`
        SELECT migration_name
        FROM "_prisma_migrations"
        WHERE finished_at IS NULL AND rolled_back_at IS NULL;
      `);
      for (const row of failed.rows) {
        console.log(`[admin-panel] Recovering failed migration: ${row.migration_name}`);
        const result = runPrisma(['migrate', 'resolve', '--rolled-back', row.migration_name]);
        if (result.status !== 0) process.exit(result.status ?? 1);
      }
    }
  } finally {
    await client.end();
  }
}

async function main() {
  await baselineExistingDatabase();
  const result = runPrisma(['migrate', 'deploy']);
  process.exit(result.status ?? 1);
}

main().catch((error) => {
  console.error('[admin-panel] Migration preparation failed:', error);
  process.exit(1);
});