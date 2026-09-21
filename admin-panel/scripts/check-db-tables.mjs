import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const models = [
  ['Category', 'category'],
  ['Author', 'author'],
  ['TeamMember', 'teamMember'],
  ['ResourceSection', 'resourceSection'],
  ['ResourceItem', 'resourceItem'],
  ['Article', 'article'],
  ['SponsoredArticle', 'sponsoredArticle'],
  ['AdminUser', 'adminUser'],
  ['AdminSettings', 'adminSettings'],
  ['ContactMessage', 'contactMessage'],
  ['NewsletterSubscription', 'newsletterSubscription'],
  ['Media', 'media'],
  ['Partnership', 'partnership'],
  ['JobOffer', 'jobOffer'],
  ['JobApplication', 'jobApplication'],
  ['Event', 'event'],
  ['Project', 'project'],
  ['Opportunity', 'opportunity'],
  ['OpportunityApplication', 'opportunityApplication'],
  ['Partner', 'partner'],
  ['GalleryEvent', 'galleryEvent'],
];

async function main() {
  console.log('=== CONNEXION ===');
  try {
    const rows = await p.$queryRawUnsafe(
      'SELECT current_database() AS db, current_schema() AS schema, now() AS ts'
    );
    console.log('OK connecte:', JSON.stringify(rows[0], (_k, v) =>
      typeof v === 'bigint' ? v.toString() : v instanceof Date ? v.toISOString() : v
    ));
  } catch (e) {
    console.log('ECHEC connexion:', e.message?.split('\n')[0]);
    process.exit(1);
  }

  console.log('\n=== TABLES (page admin) ===');
  for (const [table, delegate] of models) {
    try {
      const count = await p[delegate].count();
      console.log(`OK  ${table.padEnd(28)} count=${count}`);
    } catch (e) {
      const raw = e.message || '';
      const msg = raw.includes('does not exist')
        ? 'MANQUANTE'
        : raw.split('\n').find(Boolean) || 'ERREUR';
      console.log(`NO  ${table.padEnd(28)} ${msg}`);
    }
  }
}

main()
  .then(() => p.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await p.$disconnect();
    process.exit(1);
  });
