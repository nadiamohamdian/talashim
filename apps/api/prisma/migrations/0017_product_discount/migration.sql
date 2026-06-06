-- Product discount fields (admin + storefront pricing)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "discountPercent" INTEGER;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "discountStartsAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "discountEndsAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Product_discountPercent_discountEndsAt_idx"
  ON "Product"("discountPercent", "discountEndsAt");
