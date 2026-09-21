/**
 * Create AdminUser tables + set password for local login.
 * Usage: node scripts/ensure-admin-login.mjs
 * Optional: ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=...
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const env = {};
const envPath = path.join(__dirname, '..', '.env');
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx >= 0) env[line.slice(0, idx)] = line.slice(idx + 1).replace(/^"|"$/g, '');
}

const connectionString = env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing');

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const name = process.env.ADMIN_NAME || 'Admin';
const password = process.env.ADMIN_PASSWORD || '';
if (!email || !password) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running this script.');
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();

  const unlock = [
    'AdminUser',
    'AdminSession',
    'AdminPasswordReset',
    'AdminSettings',
  ];
  for (const table of unlock) {
    try {
      await client.query(`ALTER TABLE IF EXISTS public."${table}" SET (schema_locked = false);`);
    } catch (_) {}
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS public."AdminUser" (
      "id" STRING PRIMARY KEY,
      "email" STRING NOT NULL UNIQUE,
      "name" STRING NOT NULL,
      "passwordHash" STRING,
      "avatarUrl" STRING,
      "provider" STRING NOT NULL DEFAULT 'email',
      "googleId" STRING UNIQUE,
      "role" STRING NOT NULL DEFAULT 'admin',
      "isActive" BOOL NOT NULL DEFAULT true,
      "emailVerified" BOOL NOT NULL DEFAULT false,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "lastLoginAt" TIMESTAMPTZ
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public."AdminSession" (
      "id" STRING PRIMARY KEY,
      "adminUserId" STRING NOT NULL,
      "token" STRING NOT NULL UNIQUE,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public."AdminPasswordReset" (
      "id" STRING PRIMARY KEY,
      "adminUserId" STRING NOT NULL,
      "tokenHash" STRING NOT NULL UNIQUE,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await client.query(`CREATE INDEX IF NOT EXISTS "AdminUser_email_idx" ON public."AdminUser" ("email");`);
  await client.query(`CREATE INDEX IF NOT EXISTS "AdminSession_adminUserId_idx" ON public."AdminSession" ("adminUserId");`);
  await client.query(`CREATE INDEX IF NOT EXISTS "AdminPasswordReset_adminUserId_idx" ON public."AdminPasswordReset" ("adminUserId");`);

  try {
    await client.query(`
      ALTER TABLE public."AdminSession"
      ADD CONSTRAINT "AdminSession_adminUserId_fkey"
      FOREIGN KEY ("adminUserId") REFERENCES public."AdminUser" ("id") ON DELETE CASCADE;
    `);
  } catch (_) {}
  try {
    await client.query(`
      ALTER TABLE public."AdminPasswordReset"
      ADD CONSTRAINT "AdminPasswordReset_adminUserId_fkey"
      FOREIGN KEY ("adminUserId") REFERENCES public."AdminUser" ("id") ON DELETE CASCADE;
    `);
  } catch (_) {}

  const passwordHash = await bcrypt.hash(password, 12);
  const id = `cuid_${Date.now().toString(36)}`;

  await client.query(
    `
    INSERT INTO public."AdminUser"
      ("id", "email", "name", "passwordHash", "provider", "role", "isActive", "emailVerified", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, 'email', 'admin', true, true, now(), now())
    ON CONFLICT ("email") DO UPDATE SET
      "name" = EXCLUDED."name",
      "passwordHash" = EXCLUDED."passwordHash",
      "provider" = 'email',
      "role" = 'admin',
      "isActive" = true,
      "emailVerified" = true,
      "updatedAt" = now();
    `,
    [id, email, name, passwordHash]
  );

  console.log('OK — compte admin prêt');
  console.log(`Email   : ${email}`);
  console.log(`Password: ${password}`);
  console.log('Connecte-toi sur http://localhost:3000/login');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => client.end());
