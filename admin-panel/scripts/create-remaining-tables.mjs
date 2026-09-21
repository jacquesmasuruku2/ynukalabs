import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS "ResourceSection" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "description" STRING,
    "displayOrder" INT4 NOT NULL DEFAULT 0::INT4,
    "isActive" BOOL NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "ResourceSection_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ResourceSection_slug_key" ON "ResourceSection"("slug")`,
  `CREATE INDEX IF NOT EXISTS "ResourceSection_isActive_idx" ON "ResourceSection"("isActive")`,
  `CREATE INDEX IF NOT EXISTS "ResourceSection_displayOrder_idx" ON "ResourceSection"("displayOrder")`,

  `CREATE TABLE IF NOT EXISTS "ResourceItem" (
    "id" STRING NOT NULL,
    "sectionId" STRING,
    "title" STRING NOT NULL,
    "titleFr" STRING,
    "description" STRING,
    "descriptionFr" STRING,
    "category" STRING,
    "url" STRING,
    "filePath" STRING,
    "fileType" STRING,
    "iconKey" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "ResourceItem_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "ResourceItem_sectionId_idx" ON "ResourceItem"("sectionId")`,
  `CREATE INDEX IF NOT EXISTS "ResourceItem_category_idx" ON "ResourceItem"("category")`,

  `CREATE TABLE IF NOT EXISTS "AdminSettings" (
    "id" STRING NOT NULL DEFAULT 'global',
    "siteName" STRING NOT NULL DEFAULT 'Ynuka Labs',
    "contactEmail" STRING NOT NULL DEFAULT 'contact@ynukalabs.com',
    "emailNotifications" BOOL NOT NULL DEFAULT true,
    "securityAlerts" BOOL NOT NULL DEFAULT true,
    "weeklyReports" BOOL NOT NULL DEFAULT false,
    "publicApiKey" STRING NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedById" STRING,
    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AdminSettings_publicApiKey_key" ON "AdminSettings"("publicApiKey")`,
  `CREATE INDEX IF NOT EXISTS "AdminSettings_updatedById_idx" ON "AdminSettings"("updatedById")`,

  `CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "email" STRING NOT NULL,
    "subject" STRING,
    "message" STRING NOT NULL,
    "status" STRING NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "ContactMessage_status_idx" ON "ContactMessage"("status")`,
  `CREATE INDEX IF NOT EXISTS "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt" DESC)`,

  `CREATE TABLE IF NOT EXISTS "Partnership" (
    "id" STRING NOT NULL,
    "companyName" STRING NOT NULL,
    "contactName" STRING NOT NULL,
    "email" STRING NOT NULL,
    "phone" STRING,
    "type" STRING NOT NULL,
    "description" STRING,
    "imageUrl" STRING,
    "websiteUrl" STRING,
    "status" STRING NOT NULL DEFAULT 'pending',
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "Partnership_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "Partnership_status_idx" ON "Partnership"("status")`,
  `CREATE INDEX IF NOT EXISTS "Partnership_type_idx" ON "Partnership"("type")`,
];

async function main() {
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('OK:', sql.slice(0, 55).replace(/\s+/g, ' '));
    } catch (e) {
      console.error('FAIL:', (e.message || '').split('\n')[0]);
    }
  }

  const existing = await prisma.adminSettings.findUnique({ where: { id: 'global' } }).catch(() => null);
  if (!existing) {
    await prisma.adminSettings.create({
      data: {
        id: 'global',
        siteName: 'Ynuka Labs',
        contactEmail: 'contact@ynukalabs.com',
        publicApiKey: randomBytes(24).toString('hex'),
      },
    });
    console.log('Seed AdminSettings global OK');
  } else {
    console.log('AdminSettings deja present');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
