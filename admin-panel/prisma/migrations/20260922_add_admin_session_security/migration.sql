ALTER TABLE IF EXISTS "AdminSession" SET (schema_locked = false);
ALTER TABLE "AdminSession" ADD COLUMN IF NOT EXISTS "ipAddress" STRING;
ALTER TABLE "AdminSession" ADD COLUMN IF NOT EXISTS "userAgent" STRING;
ALTER TABLE "AdminSession" ADD COLUMN IF NOT EXISTS "device" STRING;