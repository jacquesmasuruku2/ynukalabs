import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS "EventProposal" (
    "id" STRING NOT NULL,
    "contactName" STRING NOT NULL,
    "contactEmail" STRING NOT NULL,
    "contactPhone" STRING,
    "organization" STRING NOT NULL,
    "title" STRING NOT NULL,
    "description" STRING NOT NULL,
    "category" STRING NOT NULL,
    "eventDate" TIMESTAMPTZ,
    "eventTime" STRING,
    "timezone" STRING,
    "format" STRING NOT NULL,
    "locationOrLink" STRING,
    "venue" STRING,
    "onlineLink" STRING,
    "audience" STRING,
    "capacity" INT4,
    "publicationChannel" STRING NOT NULL DEFAULT 'ynuka_agenda',
    "externalEventUrl" STRING,
    "registrationMode" STRING,
    "registrationUrl" STRING,
    "imageUrl" STRING,
    "imageData" STRING,
    "imageFilename" STRING,
    "partners" STRING,
    "speakers" STRING,
    "status" STRING NOT NULL DEFAULT 'pending',
    "adminNotes" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "EventProposal_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "EventProposal_status_idx" ON "EventProposal"("status")`,
  `CREATE INDEX IF NOT EXISTS "EventProposal_createdAt_idx" ON "EventProposal"("createdAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS "EventProposal_contactEmail_idx" ON "EventProposal"("contactEmail")`,
];

async function main() {
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
    console.log('OK:', sql.slice(0, 60).replace(/\s+/g, ' '));
  }
  const count = await prisma.$queryRawUnsafe('SELECT count(*)::int AS c FROM "EventProposal"');
  console.log('EventProposal ready', count);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
