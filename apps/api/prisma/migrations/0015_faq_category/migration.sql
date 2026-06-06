-- Ensure FAQ blog category exists for CMS FAQ posts
INSERT INTO "BlogCategory" ("id", "slug", "title", "createdAt")
SELECT gen_random_uuid()::text, 'faq', 'سوالات متداول', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "BlogCategory" WHERE "slug" = 'faq'
);
