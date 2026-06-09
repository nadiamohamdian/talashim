-- AlterTable
ALTER TABLE "Product" ADD COLUMN "hoverImageUrl" TEXT;

UPDATE "Product" SET "hoverImageUrl" = "imageUrl" WHERE "hoverImageUrl" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "hoverImageUrl" SET NOT NULL;
