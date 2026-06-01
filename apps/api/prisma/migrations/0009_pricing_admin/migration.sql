-- PricingConfig
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "spreadPercent" DECIMAL(6,4) NOT NULL,
    "tradeCommissionPercent" DECIMAL(6,4) NOT NULL,
    "defaultMakingFeePercent" INTEGER NOT NULL DEFAULT 10,
    "refreshIntervalMs" INTEGER NOT NULL DEFAULT 30000,
    "primaryProviderName" TEXT NOT NULL DEFAULT 'brsapi',
    "fallbackProviderName" TEXT NOT NULL DEFAULT 'fallback-static',
    "brsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

-- GoldPriceOverride
CREATE TABLE "GoldPriceOverride" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL DEFAULT 'XAU-IRR',
    "karat" INTEGER NOT NULL DEFAULT 18,
    "pricePerGram" DECIMAL(20,2) NOT NULL,
    "buyPrice" DECIMAL(20,2),
    "sellPrice" DECIMAL(20,2),
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GoldPriceOverride_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GoldPriceOverride_symbol_karat_isActive_idx" ON "GoldPriceOverride"("symbol", "karat", "isActive");
CREATE INDEX "GoldPriceOverride_expiresAt_idx" ON "GoldPriceOverride"("expiresAt");

ALTER TABLE "GoldPriceOverride" ADD CONSTRAINT "GoldPriceOverride_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
