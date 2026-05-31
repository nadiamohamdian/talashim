-- CreateEnum
CREATE TYPE "GoldPriceSource" AS ENUM ('PRIMARY', 'FALLBACK', 'MANUAL');

-- CreateTable
CREATE TABLE "GoldPriceTick" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL DEFAULT 'XAU-IRR',
    "karat" INTEGER NOT NULL DEFAULT 18,
    "pricePerGram" DECIMAL(20,2) NOT NULL,
    "buyPrice" DECIMAL(20,2) NOT NULL,
    "sellPrice" DECIMAL(20,2) NOT NULL,
    "spreadPercent" DECIMAL(6,4) NOT NULL,
    "source" "GoldPriceSource" NOT NULL,
    "providerName" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoldPriceTick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoldPriceTick_symbol_karat_recordedAt_idx" ON "GoldPriceTick"("symbol", "karat", "recordedAt");

-- CreateIndex
CREATE INDEX "GoldPriceTick_recordedAt_idx" ON "GoldPriceTick"("recordedAt");
