CREATE TABLE "TeamMember" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "imageAlt" TEXT,
  "xUrl" TEXT,
  "linkedinUrl" TEXT,
  "telegramUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TeamMember_slug_key" ON "TeamMember"("slug");
CREATE INDEX "TeamMember_isActive_idx" ON "TeamMember"("isActive");
CREATE INDEX "TeamMember_name_idx" ON "TeamMember"("name");