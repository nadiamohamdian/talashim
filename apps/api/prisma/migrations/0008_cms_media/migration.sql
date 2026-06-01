-- BlogPost CMS fields
ALTER TABLE "BlogPost" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BlogPost" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "BlogPost_categoryId_sortOrder_idx" ON "BlogPost"("categoryId", "sortOrder");
CREATE INDEX "BlogPost_isPublished_publishedAt_idx" ON "BlogPost"("isPublished", "publishedAt");

-- Enums
CREATE TYPE "CmsBannerPlacement" AS ENUM ('HOME_HERO', 'HOME_MID', 'CATEGORY_TOP', 'GLOBAL');
CREATE TYPE "CmsBannerStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CmsBanner
CREATE TABLE "CmsBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "placement" "CmsBannerPlacement" NOT NULL DEFAULT 'HOME_MID',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CmsBannerStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CmsBanner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CmsBanner_status_placement_sortOrder_idx" ON "CmsBanner"("status", "placement", "sortOrder");

-- CmsHomepage
CREATE TABLE "CmsHomepage" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "hero" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CmsHomepage_pkey" PRIMARY KEY ("id")
);

-- CmsStaticPage
CREATE TABLE "CmsStaticPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CmsStaticPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CmsStaticPage_slug_key" ON "CmsStaticPage"("slug");

-- CmsSeoSettings
CREATE TABLE "CmsSeoSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteTitle" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "defaultOgImageUrl" TEXT,
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "googleAnalyticsId" TEXT,
    "extraMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CmsSeoSettings_pkey" PRIMARY KEY ("id")
);

-- MediaAsset
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "alt" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MediaAsset_folder_createdAt_idx" ON "MediaAsset"("folder", "createdAt");

ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
