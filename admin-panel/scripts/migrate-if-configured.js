const { spawnSync } = require('node:child_process');

if (!process.env.DATABASE_URL) {
  console.warn('[admin-panel] DATABASE_URL is not configured; skipping Prisma migrations for this preview build.');
  process.exit(0);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);