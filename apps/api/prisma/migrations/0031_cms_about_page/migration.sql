-- CmsAboutPage
CREATE TABLE "CmsAboutPage" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "meta" JSONB NOT NULL,
    "copy" JSONB NOT NULL,
    "decorImageUrl" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsAboutPage_pkey" PRIMARY KEY ("id")
);
