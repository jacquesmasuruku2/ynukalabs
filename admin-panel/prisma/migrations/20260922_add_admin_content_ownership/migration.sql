ALTER TABLE IF EXISTS "AdminContentOwnership" SET (schema_locked = false);

CREATE TABLE IF NOT EXISTS "AdminContentOwnership" (
  "id" STRING PRIMARY KEY,
  "resourceType" STRING NOT NULL,
  "resourceId" STRING NOT NULL,
  "adminUserId" STRING NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AdminContentOwnership_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE,
  CONSTRAINT "AdminContentOwnership_resource_unique" UNIQUE ("resourceType", "resourceId")
);
CREATE INDEX IF NOT EXISTS "AdminContentOwnership_adminUserId_idx" ON "AdminContentOwnership" ("adminUserId");
CREATE INDEX IF NOT EXISTS "AdminContentOwnership_resource_idx" ON "AdminContentOwnership" ("resourceType", "resourceId");