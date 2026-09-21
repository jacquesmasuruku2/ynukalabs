import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS "SitePresence" (
    "id" STRING NOT NULL,
    "sessionId" STRING NOT NULL,
    "path" STRING NOT NULL,
    "pageTitle" STRING,
    "referrer" STRING,
    "userAgent" STRING,
    "language" STRING,
    "userEmail" STRING,
    "userName" STRING,
    "firstSeenAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "lastSeenAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "SitePresence_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SitePresence_sessionId_key" ON "SitePresence"("sessionId")`,
  `CREATE INDEX IF NOT EXISTS "SitePresence_lastSeenAt_idx" ON "SitePresence"("lastSeenAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS "SitePresence_path_idx" ON "SitePresence"("path")`,
  `CREATE INDEX IF NOT EXISTS "SitePresence_userEmail_idx" ON "SitePresence"("userEmail")`,
];

async function main() {
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('OK:', sql.slice(0, 70).replace(/\s+/g, ' '));
    } catch (err) {
      console.error('FAIL:', err instanceof Error ? err.message : err);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
