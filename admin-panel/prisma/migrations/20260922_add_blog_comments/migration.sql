ALTER TABLE IF EXISTS "BlogComment" SET (schema_locked = false);

CREATE TABLE IF NOT EXISTS "BlogComment" (
  "id" STRING PRIMARY KEY,
  "articleId" STRING NOT NULL,
  "authorName" STRING NOT NULL,
  "authorEmail" STRING NOT NULL,
  "content" STRING NOT NULL,
  "approved" BOOL NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "BlogComment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "BlogComment_articleId_idx" ON "BlogComment" ("articleId");
CREATE INDEX IF NOT EXISTS "BlogComment_approved_idx" ON "BlogComment" ("approved");