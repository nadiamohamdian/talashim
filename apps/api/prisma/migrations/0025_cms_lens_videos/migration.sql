-- CreateTable
CREATE TABLE "CmsLensVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CmsBannerStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsLensVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CmsLensVideo_status_sortOrder_idx" ON "CmsLensVideo"("status", "sortOrder");
