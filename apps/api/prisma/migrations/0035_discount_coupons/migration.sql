-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED_AMOUNT');

-- CreateTable
CREATE TABLE "DiscountCoupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DECIMAL(12,2) NOT NULL,
    "minimumOrderAmount" BIGINT,
    "maximumDiscountAmount" BIGINT,
    "usageLimitTotal" INTEGER,
    "usageLimitPerUser" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isFirstPurchaseOnly" BOOLEAN NOT NULL DEFAULT false,
    "allowWithOtherCoupons" BOOLEAN NOT NULL DEFAULT false,
    "applicableCategories" "ProductCategory"[] DEFAULT ARRAY[]::"ProductCategory"[],
    "applicableProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedCategories" "ProductCategory"[] DEFAULT ARRAY[]::"ProductCategory"[],
    "applicableUsers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedUsers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customerGroup" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DiscountCoupon_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "couponId" TEXT,
ADD COLUMN "couponCode" TEXT,
ADD COLUMN "discountToman" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "discountAmount" BIGINT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCoupon_code_key" ON "DiscountCoupon"("code");

-- CreateIndex
CREATE INDEX "DiscountCoupon_isActive_startsAt_expiresAt_idx" ON "DiscountCoupon"("isActive", "startsAt", "expiresAt");

-- CreateIndex
CREATE INDEX "DiscountCoupon_deletedAt_idx" ON "DiscountCoupon"("deletedAt");

-- CreateIndex
CREATE INDEX "CouponUsage_couponId_usedAt_idx" ON "CouponUsage"("couponId", "usedAt");

-- CreateIndex
CREATE INDEX "CouponUsage_userId_usedAt_idx" ON "CouponUsage"("userId", "usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_couponId_userId_orderId_key" ON "CouponUsage"("couponId", "userId", "orderId");

-- AddForeignKey
ALTER TABLE "DiscountCoupon" ADD CONSTRAINT "DiscountCoupon_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCoupon" ADD CONSTRAINT "DiscountCoupon_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "DiscountCoupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "DiscountCoupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
