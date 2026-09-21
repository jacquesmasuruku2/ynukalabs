import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS "SitePageView" (
    "id" STRING NOT NULL,
    "sessionId" STRING NOT NULL,
    "path" STRING NOT NULL,
    "pageTitle" STRING,
    "referrer" STRING,
    "userAgent" STRING,
    "language" STRING,
    "userEmail" STRING,
    "userName" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "SitePageView_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "SitePageView_createdAt_idx" ON "SitePageView"("createdAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS "SitePageView_sessionId_idx" ON "SitePageView"("sessionId")`,
  `CREATE INDEX IF NOT EXISTS "SitePageView_path_idx" ON "SitePageView"("path")`,
  `CREATE INDEX IF NOT EXISTS "SitePageView_userEmail_idx" ON "SitePageView"("userEmail")`,
];

async function main() {
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('OK:', sql.slice(0, 64).replace(/\s+/g, ' '));
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
