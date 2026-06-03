-- Add SKU to products
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" TEXT;

UPDATE "Product" SET "sku" = 'SG-R-0412-01' WHERE "slug" = 'van-cleef-alhambra-ring' AND "sku" IS NULL;
UPDATE "Product" SET "sku" = 'SG-R-0480-01' WHERE "slug" = 'royal-ring' AND "sku" IS NULL;
UPDATE "Product" SET "sku" = 'TL-N-1120-01' WHERE "slug" = 'talashim-necklace' AND "sku" IS NULL;
UPDATE "Product" SET "sku" = CONCAT('SG-P-', LEFT("id", 8)) WHERE "sku" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");
