/**
 * One-shot migration: PHP/MySQL public API → Cockroach via Admin Panel Prisma HTTP API
 * (or direct Prisma if run inside admin-panel with DATABASE_URL).
 *
 * Usage (from admin-panel):
 *   node scripts/migrate-php-to-cockroach.mjs
 *
 * Env:
 *   PHP_API_URL   default https://admin.ynukalabs.com/api/api.php
 *   ADMIN_API_URL default http://localhost:3000  (must be running with new routes)
 *   DRY_RUN=1     log only, no writes
 */

const PHP_API = (process.env.PHP_API_URL || 'https://admin.ynukalabs.com/api/api.php').replace(/\/$/, '');
const ADMIN_API = (process.env.ADMIN_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const DRY = process.env.DRY_RUN === '1';

async function phpList(resource, limit = 500) {
  const url = new URL(PHP_API);
  url.searchParams.set('action', 'list');
  url.searchParams.set('resource', resource);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PHP ${resource}: ${res.status}`);
  const data = await res.json();
  return data.rows || data.data || [];
}

async function adminPost(path, body) {
  if (DRY) {
    console.log('[DRY]', path, body.title || body.name || body.slug || body.id);
    return { dry: true };
  }
  const res = await fetch(`${ADMIN_API}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`POST ${path}: ${res.status} ${err}`);
  }
  return res.json();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `item-${Date.now()}`;
}

async function migrateEvents() {
  const rows = await phpList('events');
  console.log(`Events: ${rows.length}`);
  for (const item of rows) {
    await adminPost('/events', {
      title: item.title || 'Untitled',
      titleFr: item.title_fr || null,
      slug: item.slug || slugify(item.title),
      description: item.description || null,
      descriptionFr: item.description_fr || null,
      date: item.date || item.start_date || null,
      startDate: item.start_date || null,
      endDate: item.end_date || null,
      time: item.time || null,
      location: item.location || null,
      type: item.type || null,
      capacity: item.capacity != null ? Number(item.capacity) : null,
      imageUrl: item.image_url || item.featured_image || null,
      featuredImage: item.featured_image || null,
      upcoming: item.upcoming != null ? Boolean(Number(item.upcoming)) : true,
      published: item.published == null ? true : Boolean(Number(item.published)),
      legacyId: String(item.id),
    });
  }
}

async function migrateProjects() {
  const rows = await phpList('projects');
  console.log(`Projects: ${rows.length}`);
  for (const item of rows) {
    await adminPost('/projects', {
      title: item.title || 'Untitled',
      slug: item.slug || slugify(item.title),
      category: item.category || 'General',
      description: item.description || null,
      status: item.status || 'active',
      featuredImage: item.featured_image || item.image_url || null,
      repositoryUrl: item.repository_url || null,
      liveUrl: item.live_url || null,
      showOnHome: Boolean(Number(item.show_on_home || item.show_on_homepage || 0)),
      legacyId: String(item.id),
    });
  }
}

async function migrateOpportunities() {
  const rows = await phpList('opportunities');
  console.log(`Opportunities: ${rows.length}`);
  for (const item of rows) {
    await adminPost('/opportunities', {
      title: item.title || 'Untitled',
      titleFr: item.title_fr || null,
      slug: item.slug || slugify(item.title),
      excerpt: item.excerpt || null,
      excerptFr: item.excerpt_fr || null,
      content: item.content || null,
      contentFr: item.content_fr || null,
      category: item.category || 'General',
      coverUrl: item.cover_url || null,
      published: item.published == null ? true : Boolean(Number(item.published)),
      legacyId: String(item.id),
    });
  }
}

async function migratePartners() {
  const rows = await phpList('partners');
  console.log(`Partners: ${rows.length}`);
  for (const item of rows) {
    await adminPost('/partners', {
      name: item.name || 'Partner',
      slug: item.slug || slugify(item.name),
      description: item.description || null,
      logoUrl: item.logo_url || null,
      websiteUrl: item.website_url || item.url || null,
      displayOrder: Number(item.display_order || 0),
      isActive: item.is_active == null ? true : Boolean(Number(item.is_active)),
      legacyId: String(item.id),
    });
  }
}

async function migrateTeam() {
  const rows = await phpList('team_members');
  console.log(`Team: ${rows.length}`);
  for (const item of rows) {
    let social = {};
    try {
      social = typeof item.social_links === 'string' ? JSON.parse(item.social_links) : item.social_links || {};
    } catch {
      social = {};
    }
    await adminPost('/team-members', {
      name: item.name || 'Member',
      slug: item.slug || slugify(item.name),
      role: item.role || 'Team',
      description: item.description || null,
      imageUrl: item.image_url || null,
      imageAlt: item.image_alt || null,
      xUrl: social.x || social.twitter || null,
      linkedinUrl: social.linkedin || null,
      telegramUrl: social.telegram || null,
      portfolioUrl: item.portfolio_url || null,
      displayOrder: Number(item.display_order || 0),
      isActive: item.active == null ? true : Boolean(Number(item.active)),
      legacyId: String(item.id),
    });
  }
}

async function migrateGallery() {
  const rows = await phpList('gallery_events');
  console.log(`Gallery: ${rows.length}`);
  for (const item of rows) {
    let images = item.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        images = [];
      }
    }
    await adminPost('/gallery-events', {
      title: item.title || 'Gallery',
      subtitle: item.subtitle || null,
      date: item.date || null,
      description: item.description || null,
      images: Array.isArray(images) ? images : [],
      legacyId: String(item.id),
    });
  }
}

async function main() {
  console.log(`PHP: ${PHP_API}`);
  console.log(`Admin: ${ADMIN_API}`);
  console.log(DRY ? 'DRY RUN' : 'LIVE WRITE');
  await migrateEvents();
  await migrateProjects();
  await migrateOpportunities();
  await migratePartners();
  await migrateTeam();
  await migrateGallery();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
