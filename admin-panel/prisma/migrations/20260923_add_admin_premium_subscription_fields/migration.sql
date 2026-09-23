ALTER TABLE IF EXISTS "AdminUser" SET (schema_locked = false);

ALTER TABLE "AdminUser"
  ADD COLUMN IF NOT EXISTS "isPremium" BOOL NOT NULL DEFAULT false;

ALTER TABLE "AdminUser"
  ADD COLUMN IF NOT EXISTS "premiumPlan" STRING(32);

ALTER TABLE "AdminUser"
  ADD COLUMN IF NOT EXISTS "premiumStartedAt" TIMESTAMPTZ;

ALTER TABLE "AdminUser"
  ADD COLUMN IF NOT EXISTS "premiumExpiresAt" TIMESTAMPTZ;

ALTER TABLE "AdminUser" SET (schema_locked = true);
