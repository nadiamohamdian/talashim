-- CreateTable
CREATE TABLE "CmsLensVideoProduct" (
    "id" TEXT NOT NULL,
    "lensVideoId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CmsLensVideoProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CmsLensVideoProduct_lensVideoId_sortOrder_idx" ON "CmsLensVideoProduct"("lensVideoId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CmsLensVideoProduct_lensVideoId_productId_key" ON "CmsLensVideoProduct"("lensVideoId", "productId");

-- AddForeignKey
ALTER TABLE "CmsLensVideoProduct" ADD CONSTRAINT "CmsLensVideoProduct_lensVideoId_fkey" FOREIGN KEY ("lensVideoId") REFERENCES "CmsLensVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsLensVideoProduct" ADD CONSTRAINT "CmsLensVideoProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
