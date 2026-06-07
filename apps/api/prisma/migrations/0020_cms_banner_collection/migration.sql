-- CreateEnum
CREATE TYPE "CmsBannerLinkType" AS ENUM ('URL', 'COLLECTION');

-- AlterTable
ALTER TABLE "CmsBanner" ADD COLUMN "linkType" "CmsBannerLinkType" NOT NULL DEFAULT 'URL';

-- CreateTable
CREATE TABLE "CmsBannerProduct" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CmsBannerProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CmsBannerProduct_bannerId_sortOrder_idx" ON "CmsBannerProduct"("bannerId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CmsBannerProduct_bannerId_productId_key" ON "CmsBannerProduct"("bannerId", "productId");

-- AddForeignKey
ALTER TABLE "CmsBannerProduct" ADD CONSTRAINT "CmsBannerProduct_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "CmsBanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsBannerProduct" ADD CONSTRAINT "CmsBannerProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
