import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS "Category" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "description" STRING,
    "color" STRING,
    "icon" STRING,
    "defaultLocale" STRING NOT NULL DEFAULT 'fr',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug")`,

  `CREATE TABLE IF NOT EXISTS "CategoryTranslation" (
    "id" STRING NOT NULL,
    "categoryId" STRING NOT NULL,
    "locale" STRING NOT NULL,
    "title" STRING NOT NULL,
    "description" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CategoryTranslation_categoryId_locale_key" ON "CategoryTranslation"("categoryId", "locale")`,
  `CREATE INDEX IF NOT EXISTS "CategoryTranslation_categoryId_idx" ON "CategoryTranslation"("categoryId")`,
  `CREATE INDEX IF NOT EXISTS "CategoryTranslation_locale_idx" ON "CategoryTranslation"("locale")`,

  `CREATE TABLE IF NOT EXISTS "Author" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "bio" STRING,
    "role" STRING,
    "email" STRING,
    "imageUrl" STRING,
    "imageAlt" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Author_slug_key" ON "Author"("slug")`,

  `CREATE TABLE IF NOT EXISTS "Article" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "excerpt" STRING NOT NULL,
    "content" JSONB NOT NULL,
    "categoryId" STRING NOT NULL,
    "authorId" STRING,
    "publishedAt" TIMESTAMPTZ NOT NULL,
    "mainImageUrl" STRING,
    "externalLink" STRING,
    "mainImageAlt" STRING,
    "additionalImages" JSONB DEFAULT '[]'::JSONB,
    "additionalImageDescriptions" JSONB DEFAULT '[]'::JSONB,
    "readTime" STRING,
    "featured" BOOL NOT NULL DEFAULT false,
    "isPremium" BOOL NOT NULL DEFAULT false,
    "premiumPrice" DECIMAL(10,2),
    "views" INT8 NOT NULL DEFAULT 0::INT8,
    "defaultLocale" STRING NOT NULL DEFAULT 'fr',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug")`,
  `CREATE INDEX IF NOT EXISTS "Article_categoryId_idx" ON "Article"("categoryId")`,
  `CREATE INDEX IF NOT EXISTS "Article_authorId_idx" ON "Article"("authorId")`,
  `CREATE INDEX IF NOT EXISTS "Article_publishedAt_idx" ON "Article"("publishedAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS "Article_featured_idx" ON "Article"("featured")`,
  `CREATE INDEX IF NOT EXISTS "Article_isPremium_idx" ON "Article"("isPremium")`,
  `CREATE INDEX IF NOT EXISTS "Article_views_idx" ON "Article"("views" DESC)`,

  `CREATE TABLE IF NOT EXISTS "ArticleTranslation" (
    "id" STRING NOT NULL,
    "articleId" STRING NOT NULL,
    "locale" STRING NOT NULL,
    "title" STRING NOT NULL,
    "excerpt" STRING NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "ArticleTranslation_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ArticleTranslation_articleId_locale_key" ON "ArticleTranslation"("articleId", "locale")`,
  `CREATE INDEX IF NOT EXISTS "ArticleTranslation_articleId_idx" ON "ArticleTranslation"("articleId")`,
  `CREATE INDEX IF NOT EXISTS "ArticleTranslation_locale_idx" ON "ArticleTranslation"("locale")`,

  `CREATE TABLE IF NOT EXISTS "SponsoredArticle" (
    "id" STRING NOT NULL,
    "articleId" STRING,
    "title" STRING NOT NULL,
    "imageUrl" STRING NOT NULL,
    "targetUrl" STRING NOT NULL,
    "sponsorName" STRING NOT NULL,
    "categoryBadge" STRING NOT NULL DEFAULT 'Publicité',
    "isActive" BOOL NOT NULL DEFAULT true,
    "sortOrder" INT4 NOT NULL DEFAULT 0::INT4,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "SponsoredArticle_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "SponsoredArticle_articleId_idx" ON "SponsoredArticle"("articleId")`,
  `CREATE INDEX IF NOT EXISTS "SponsoredArticle_isActive_idx" ON "SponsoredArticle"("isActive")`,
  `CREATE INDEX IF NOT EXISTS "SponsoredArticle_sortOrder_idx" ON "SponsoredArticle"("sortOrder")`,

  `CREATE TABLE IF NOT EXISTS "Media" (
    "id" STRING NOT NULL,
    "type" STRING NOT NULL,
    "title" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "description" STRING,
    "url" STRING NOT NULL,
    "thumbnailUrl" STRING,
    "duration" INT8,
    "categoryId" STRING,
    "authorId" STRING,
    "publishedAt" TIMESTAMPTZ NOT NULL,
    "views" INT8 NOT NULL DEFAULT 0::INT8,
    "featured" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Media_slug_key" ON "Media"("slug")`,
  `CREATE INDEX IF NOT EXISTS "Media_type_idx" ON "Media"("type")`,
  `CREATE INDEX IF NOT EXISTS "Media_categoryId_idx" ON "Media"("categoryId")`,
  `CREATE INDEX IF NOT EXISTS "Media_publishedAt_idx" ON "Media"("publishedAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS "Media_featured_idx" ON "Media"("featured")`,

  `CREATE TABLE IF NOT EXISTS "NewsletterSubscription" (
    "id" STRING NOT NULL,
    "email" STRING NOT NULL,
    "name" STRING,
    "interests" JSONB,
    "isActive" BOOL NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "unsubscribedAt" TIMESTAMPTZ,
    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email")`,

  `CREATE TABLE IF NOT EXISTS "JobOffer" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "description" STRING NOT NULL,
    "requirements" STRING,
    "details" JSONB DEFAULT '{}'::JSONB,
    "imageUrl" STRING,
    "location" STRING,
    "type" STRING NOT NULL,
    "salary" STRING,
    "companyId" STRING,
    "publishedAt" TIMESTAMPTZ NOT NULL,
    "deadline" TIMESTAMPTZ,
    "featured" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "JobOffer_slug_key" ON "JobOffer"("slug")`,
  `CREATE INDEX IF NOT EXISTS "JobOffer_type_idx" ON "JobOffer"("type")`,
  `CREATE INDEX IF NOT EXISTS "JobOffer_publishedAt_idx" ON "JobOffer"("publishedAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS "JobOffer_featured_idx" ON "JobOffer"("featured")`,
  `CREATE INDEX IF NOT EXISTS "JobOffer_deadline_idx" ON "JobOffer"("deadline")`,

  `CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id" STRING NOT NULL,
    "jobOfferId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "email" STRING NOT NULL,
    "phone" STRING,
    "coverLetter" STRING,
    "resumeUrl" STRING,
    "status" STRING NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "JobApplication_jobOfferId_idx" ON "JobApplication"("jobOfferId")`,
];

async function main() {
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('OK:', sql.slice(0, 70).replace(/\s+/g, ' '));
    } catch (e) {
      console.error('FAIL:', (e.message || '').split('\n')[0]);
    }
  }

  const authors = await prisma.author.findMany();
  console.log('Author table OK, count =', authors.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
