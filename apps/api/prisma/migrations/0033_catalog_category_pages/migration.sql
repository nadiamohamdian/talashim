-- CreateTable
CREATE TABLE "CatalogCategoryPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "productCategory" "ProductCategory",
    "heroImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "filterConfig" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogCategoryPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogCategoryPage_slug_key" ON "CatalogCategoryPage"("slug");

-- CreateIndex
CREATE INDEX "CatalogCategoryPage_isActive_sortOrder_idx" ON "CatalogCategoryPage"("isActive", "sortOrder");
