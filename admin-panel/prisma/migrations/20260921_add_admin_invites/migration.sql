ALTER TABLE IF EXISTS "AdminInvite" SET (schema_locked = false);

CREATE TABLE IF NOT EXISTS "AdminInvite" (
  "id" STRING PRIMARY KEY,
  "email" STRING NOT NULL,
  "name" STRING,
  "tokenHash" STRING NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "acceptedAt" TIMESTAMPTZ,
  "invitedById" STRING NOT NULL,
  "adminUserId" STRING UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AdminInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "AdminUser"("id") ON DELETE CASCADE,
  CONSTRAINT "AdminInvite_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "AdminInvite_email_idx" ON "AdminInvite"("email");
CREATE INDEX IF NOT EXISTS "AdminInvite_expiresAt_idx" ON "AdminInvite"("expiresAt");
CREATE INDEX IF NOT EXISTS "AdminInvite_invitedById_idx" ON "AdminInvite"("invitedById");