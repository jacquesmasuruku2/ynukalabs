CREATE TABLE IF NOT EXISTS "AdminSettings" (
  "id" TEXT NOT NULL DEFAULT 'global',
  "siteName" TEXT NOT NULL DEFAULT 'Malakinfo.com',
  "contactEmail" TEXT NOT NULL DEFAULT 'contact@malakinfo.com',
  "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
  "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
  "weeklyReports" BOOLEAN NOT NULL DEFAULT false,
  "publicApiKey" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedById" TEXT,
  CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdminSettings_publicApiKey_key" ON "AdminSettings"("publicApiKey");
CREATE INDEX IF NOT EXISTS "AdminSettings_updatedById_idx" ON "AdminSettings"("updatedById");
ALTER TABLE "AdminSettings" ADD CONSTRAINT "AdminSettings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;