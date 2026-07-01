-- CreateTable
CREATE TABLE "BlogPostReview" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT,
    "phone" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "status" "ProductReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPostReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogPostReview_blogPostId_status_createdAt_idx" ON "BlogPostReview"("blogPostId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "BlogPostReview_phone_createdAt_idx" ON "BlogPostReview"("phone", "createdAt");

-- AddForeignKey
ALTER TABLE "BlogPostReview" ADD CONSTRAINT "BlogPostReview_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostReview" ADD CONSTRAINT "BlogPostReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
