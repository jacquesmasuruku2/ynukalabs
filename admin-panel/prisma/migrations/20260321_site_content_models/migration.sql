ALTER TABLE IF EXISTS "Event" SET (schema_locked = false);
ALTER TABLE IF EXISTS "EventRegistration" SET (schema_locked = false);
ALTER TABLE IF EXISTS "Project" SET (schema_locked = false);
ALTER TABLE IF EXISTS "Opportunity" SET (schema_locked = false);
ALTER TABLE IF EXISTS "OpportunityApplication" SET (schema_locked = false);
ALTER TABLE IF EXISTS "OpportunityMotivationForm" SET (schema_locked = false);
ALTER TABLE IF EXISTS "Partner" SET (schema_locked = false);
ALTER TABLE IF EXISTS "GalleryEvent" SET (schema_locked = false);
ALTER TABLE IF EXISTS "TeamMember" SET (schema_locked = false);

ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "displayOrder" INT4 NOT NULL DEFAULT 0;
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "legacyId" STRING;

CREATE TABLE IF NOT EXISTS "Event" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "titleFr" STRING,
    "slug" STRING,
    "description" STRING,
    "descriptionFr" STRING,
    "date" TIMESTAMPTZ,
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    "time" STRING,
    "location" STRING,
    "type" STRING,
    "capacity" INT4,
    "imageUrl" STRING,
    "featuredImage" STRING,
    "recapUrl" STRING,
    "youtubeUrl" STRING,
    "upcoming" BOOL NOT NULL DEFAULT true,
    "published" BOOL NOT NULL DEFAULT true,
    "legacyId" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "titleFr" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "slug" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "description" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "descriptionFr" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "date" TIMESTAMPTZ;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMPTZ;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMPTZ;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "time" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "location" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "type" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "capacity" INT4;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "imageUrl" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "featuredImage" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "recapUrl" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "youtubeUrl" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "upcoming" BOOL NOT NULL DEFAULT true;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "published" BOOL NOT NULL DEFAULT true;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "legacyId" STRING;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "EventRegistration" (
    "id" STRING NOT NULL,
    "eventId" STRING NOT NULL,
    "fullName" STRING NOT NULL,
    "email" STRING NOT NULL,
    "phone" STRING,
    "organization" STRING,
    "message" STRING,
    "status" STRING NOT NULL DEFAULT 'registered',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Project" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "category" STRING NOT NULL DEFAULT 'General',
    "description" STRING,
    "status" STRING NOT NULL DEFAULT 'active',
    "featuredImage" STRING,
    "repositoryUrl" STRING,
    "liveUrl" STRING,
    "showOnHome" BOOL NOT NULL DEFAULT false,
    "legacyId" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "showOnHome" BOOL NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "legacyId" STRING;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "repositoryUrl" STRING;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "liveUrl" STRING;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "featuredImage" STRING;

CREATE TABLE IF NOT EXISTS "Opportunity" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "titleFr" STRING,
    "slug" STRING NOT NULL,
    "excerpt" STRING,
    "excerptFr" STRING,
    "content" STRING,
    "contentFr" STRING,
    "category" STRING NOT NULL DEFAULT 'General',
    "coverUrl" STRING,
    "published" BOOL NOT NULL DEFAULT false,
    "legacyId" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OpportunityApplication" (
    "id" STRING NOT NULL,
    "opportunityId" STRING NOT NULL,
    "userEmail" STRING NOT NULL,
    "userName" STRING,
    "userAvatar" STRING,
    "status" STRING NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OpportunityApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OpportunityMotivationForm" (
    "id" STRING NOT NULL,
    "opportunityId" STRING NOT NULL,
    "userEmail" STRING NOT NULL,
    "userName" STRING,
    "userAvatar" STRING,
    "linkedinUrl" STRING,
    "twitterUrl" STRING,
    "portfolioUrl" STRING,
    "message" STRING,
    "cvFileUrl" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OpportunityMotivationForm_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Partner" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "slug" STRING,
    "description" STRING,
    "logoUrl" STRING,
    "websiteUrl" STRING,
    "displayOrder" INT4 NOT NULL DEFAULT 0,
    "isActive" BOOL NOT NULL DEFAULT true,
    "legacyId" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GalleryEvent" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "subtitle" STRING,
    "date" TIMESTAMPTZ,
    "description" STRING,
    "images" JSONB NOT NULL DEFAULT '[]',
    "legacyId" STRING,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryEvent_pkey" PRIMARY KEY ("id")
);
