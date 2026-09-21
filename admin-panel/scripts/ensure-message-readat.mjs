import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "EventMessage" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMPTZ'
  );
  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS "EventMessage_readAt_idx" ON "EventMessage"("readAt")'
  );
  console.log('OK: EventMessage.readAt');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
