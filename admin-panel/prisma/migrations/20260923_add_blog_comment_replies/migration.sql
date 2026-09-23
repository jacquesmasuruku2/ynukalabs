ALTER TABLE IF EXISTS "BlogCommentReply" SET (schema_locked = false);

CREATE TABLE IF NOT EXISTS "BlogCommentReply" (
  "id" STRING PRIMARY KEY,
  "commentId" STRING NOT NULL,
  "authorName" STRING NOT NULL,
  "authorEmail" STRING NOT NULL,
  "content" STRING NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "BlogCommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "BlogComment"("id") ON DELETE CASCADE
);

ALTER TABLE "BlogCommentReply" SET (schema_locked = false);

CREATE INDEX IF NOT EXISTS "BlogCommentReply_commentId_idx" ON "BlogCommentReply" ("commentId");

ALTER TABLE "BlogCommentReply" SET (schema_locked = true);