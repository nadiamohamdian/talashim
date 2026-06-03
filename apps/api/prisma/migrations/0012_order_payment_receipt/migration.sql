-- PaymentStatus extensions for card-to-card receipt flow
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'AWAITING_RECEIPT';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'RECEIPT_SUBMITTED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- Order shipping address
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingAddressId" TEXT;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Order_shippingAddressId_fkey'
  ) THEN
    ALTER TABLE "Order"
      ADD CONSTRAINT "Order_shippingAddressId_fkey"
      FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Payment receipt fields
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "receiptUploadedAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "reviewedById" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
