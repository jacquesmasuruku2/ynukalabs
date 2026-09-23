ALTER TABLE IF EXISTS "ContentReaction" SET (schema_locked = false);

CREATE TABLE IF NOT EXISTS "ContentReaction" (
  "id" STRING PRIMARY KEY,
  "resourceType" STRING NOT NULL,
  "resourceId" STRING NOT NULL,
  "userEmail" STRING NOT NULL,
  "reactionType" STRING NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ContentReaction_resourceType_resourceId_userEmail_key" UNIQUE ("resourceType", "resourceId", "userEmail")
);

CREATE INDEX IF NOT EXISTS "ContentReaction_resourceType_resourceId_idx"
  ON "ContentReaction" ("resourceType", "resourceId");

CREATE INDEX IF NOT EXISTS "ContentReaction_resourceType_resourceId_reactionType_idx"
  ON "ContentReaction" ("resourceType", "resourceId", "reactionType");

ALTER TABLE "ContentReaction" SET (schema_locked = true);
