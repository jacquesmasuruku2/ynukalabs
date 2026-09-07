const fs = require('fs');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const env = {};
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx >= 0) {
    env[line.slice(0, idx)] = line.slice(idx + 1).replace(/^"|"$/g, '');
  }
}

const connectionString = env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL missing');
}

const client = new Client({ connectionString });

async function ensureAdminSchema() {
  await client.connect();

  const queries = [
    `ALTER TABLE public."UserFavorite" SET (schema_locked = false);`,
    `ALTER TABLE public."UserPreference" SET (schema_locked = false);`,
    `CREATE TABLE IF NOT EXISTS public."AdminUser" ("id" STRING PRIMARY KEY, "email" STRING NOT NULL UNIQUE, "name" STRING NOT NULL, "passwordHash" STRING, "avatarUrl" STRING, "provider" STRING NOT NULL DEFAULT 'email', "googleId" STRING UNIQUE, "role" STRING NOT NULL DEFAULT 'admin', "isActive" BOOL NOT NULL DEFAULT true, "emailVerified" BOOL NOT NULL DEFAULT false, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "lastLoginAt" TIMESTAMPTZ);`,
    `CREATE TABLE IF NOT EXISTS public."AdminSession" ("id" STRING PRIMARY KEY, "adminUserId" STRING NOT NULL, "token" STRING NOT NULL UNIQUE, "expiresAt" TIMESTAMPTZ NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now());`,
    `CREATE TABLE IF NOT EXISTS public."AdminPasswordReset" ("id" STRING PRIMARY KEY, "adminUserId" STRING NOT NULL, "tokenHash" STRING NOT NULL UNIQUE, "expiresAt" TIMESTAMPTZ NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now());`,
    `CREATE INDEX IF NOT EXISTS "AdminUser_email_idx" ON public."AdminUser" ("email");`,
    `CREATE INDEX IF NOT EXISTS "AdminUser_provider_idx" ON public."AdminUser" ("provider");`,
    `CREATE INDEX IF NOT EXISTS "AdminSession_adminUserId_idx" ON public."AdminSession" ("adminUserId");`,
    `CREATE INDEX IF NOT EXISTS "AdminPasswordReset_adminUserId_idx" ON public."AdminPasswordReset" ("adminUserId");`,
    `CREATE INDEX IF NOT EXISTS "AdminPasswordReset_expiresAt_idx" ON public."AdminPasswordReset" ("expiresAt");`,
    `ALTER TABLE public."AdminSession" ADD CONSTRAINT IF NOT EXISTS "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES public."AdminUser" ("id") ON DELETE CASCADE;`,
    `ALTER TABLE public."AdminPasswordReset" ADD CONSTRAINT IF NOT EXISTS "AdminPasswordReset_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES public."AdminUser" ("id") ON DELETE CASCADE;`,
  ];

  for (const query of queries) {
    await client.query(query);
  }

  const adminEmail = 'jacquesmasuruku2@gmail.com';
  const defaultName = 'Jacques Masuruku';

  await client.query(
    `INSERT INTO public."AdminUser" ("id", "email", "name", "provider", "role", "isActive", "emailVerified", "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::STRING, $1, $2, 'email', 'admin', true, true, now(), now())
     ON CONFLICT ("email") DO UPDATE SET
       "name" = EXCLUDED."name",
       "provider" = EXCLUDED."provider",
       "role" = EXCLUDED."role",
       "isActive" = EXCLUDED."isActive",
       "emailVerified" = EXCLUDED."emailVerified",
       "updatedAt" = now();`,
    [adminEmail, defaultName],
  );

  console.log('Admin tables and default admin account ensured successfully.');
}

ensureAdminSchema()
  .catch((error) => {
    console.error('Failed to create admin tables:', error);
    process.exit(1);
  })
  .finally(() => client.end());
