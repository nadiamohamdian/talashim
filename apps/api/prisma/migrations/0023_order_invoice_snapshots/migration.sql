ALTER TABLE "Order" ADD COLUMN "taxPercent" INTEGER;
ALTER TABLE "Order" ADD COLUMN "liveGoldPrice18PerGramToman" BIGINT;

ALTER TABLE "OrderItem" ADD COLUMN "weightGram" DECIMAL(10,2);
ALTER TABLE "OrderItem" ADD COLUMN "karat" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "makingFeePercent" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "liveGoldPricePerGramToman" BIGINT;
ALTER TABLE "OrderItem" ADD COLUMN "metalValueToman" BIGINT;
ALTER TABLE "OrderItem" ADD COLUMN "wageToman" BIGINT;
