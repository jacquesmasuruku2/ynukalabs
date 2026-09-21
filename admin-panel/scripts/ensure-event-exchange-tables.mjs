import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statements = [
  `ALTER TABLE "EventRegistration" ADD COLUMN IF NOT EXISTS "avatarUrl" STRING`,
  `ALTER TABLE "EventRegistration" ADD COLUMN IF NOT EXISTS "googleSub" STRING`,
  `CREATE INDEX IF NOT EXISTS "EventRegistration_email_idx" ON "EventRegistration"("email")`,

  `CREATE TABLE IF NOT EXISTS "EventConversation" (
    "id" STRING NOT NULL,
    "registrationId" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "EventConversation_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "EventConversation_registrationId_key" ON "EventConversation"("registrationId")`,

  `CREATE TABLE IF NOT EXISTS "EventMessage" (
    "id" STRING NOT NULL,
    "conversationId" STRING NOT NULL,
    "senderType" STRING NOT NULL,
    "senderEmail" STRING,
    "senderName" STRING,
    "body" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "EventMessage_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "EventMessage_conversationId_idx" ON "EventMessage"("conversationId")`,
  `CREATE INDEX IF NOT EXISTS "EventMessage_createdAt_idx" ON "EventMessage"("createdAt")`,

  `CREATE TABLE IF NOT EXISTS "SiteNotification" (
    "id" STRING NOT NULL,
    "userEmail" STRING NOT NULL,
    "type" STRING NOT NULL,
    "title" STRING NOT NULL,
    "body" STRING NOT NULL,
    "link" STRING,
    "read" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "SiteNotification_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "SiteNotification_userEmail_idx" ON "SiteNotification"("userEmail")`,
  `CREATE INDEX IF NOT EXISTS "SiteNotification_read_idx" ON "SiteNotification"("read")`,
  `CREATE INDEX IF NOT EXISTS "SiteNotification_createdAt_idx" ON "SiteNotification"("createdAt" DESC)`,

  `ALTER TABLE "EventMessage" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMPTZ`,
  `CREATE INDEX IF NOT EXISTS "EventMessage_readAt_idx" ON "EventMessage"("readAt")`,
];

async function main() {
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('OK:', sql.slice(0, 72).replace(/\s+/g, ' '));
    } catch (err) {
      console.error('FAIL:', sql.slice(0, 72).replace(/\s+/g, ' '));
      console.error(err instanceof Error ? err.message : err);
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
