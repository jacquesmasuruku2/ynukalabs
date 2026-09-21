import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stamp = Date.now();

  const event = await prisma.event.create({
    data: {
      title: `Test Event Site Read ${stamp}`,
      titleFr: `Événement test lecture site ${stamp}`,
      slug: `test-event-site-read-${stamp}`,
      description: '<p><strong>Test</strong> lecture publique depuis Cockroach.</p>',
      descriptionFr: '<p><strong>Test FR</strong> lecture publique depuis Cockroach.</p>',
      date: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      location: 'Kinshasa',
      type: 'hybrid',
      upcoming: true,
      published: true,
    },
  });

  const project = await prisma.project.create({
    data: {
      title: `Test Project Site Read ${stamp}`,
      slug: `test-project-site-read-${stamp}`,
      category: 'Education',
      description: '<p>Projet test pour vérifier la lecture site.</p>',
      status: 'active',
      showOnHome: true,
    },
  });

  const partner = await prisma.partner.create({
    data: {
      name: `Partner Test ${stamp}`,
      slug: `partner-test-${stamp}`,
      isActive: true,
      displayOrder: 1,
    },
  });

  console.log(JSON.stringify({
    eventId: event.id,
    eventSlug: event.slug,
    projectId: project.id,
    partnerId: partner.id,
  }, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
