-- AlterEnum
ALTER TYPE "WalletTransactionType" ADD VALUE 'TRADE_BUY';
ALTER TYPE "WalletTransactionType" ADD VALUE 'TRADE_SELL';

-- CreateEnum
CREATE TYPE "GoldTradeSide" AS ENUM ('BUY', 'SELL');
CREATE TYPE "GoldTradeStatus" AS ENUM ('PENDING', 'FILLED', 'FAILED');

-- CreateTable
CREATE TABLE "GoldTradeOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" "GoldTradeSide" NOT NULL,
    "status" "GoldTradeStatus" NOT NULL DEFAULT 'PENDING',
    "symbol" TEXT NOT NULL DEFAULT 'XAU-IRR',
    "karat" INTEGER NOT NULL DEFAULT 18,
    "quantityGram" DECIMAL(20,6) NOT NULL,
    "unitPriceToman" DECIMAL(20,2) NOT NULL,
    "grossRial" DECIMAL(20,2) NOT NULL,
    "commissionRial" DECIMAL(20,2) NOT NULL,
    "netRial" DECIMAL(20,2) NOT NULL,
    "commissionPercent" DECIMAL(6,4) NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "walletTransactionId" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filledAt" TIMESTAMP(3),

    CONSTRAINT "GoldTradeOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldTradeAuditLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoldTradeAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoldTradeOrder_orderNumber_key" ON "GoldTradeOrder"("orderNumber");
CREATE UNIQUE INDEX "GoldTradeOrder_idempotencyKey_key" ON "GoldTradeOrder"("idempotencyKey");
CREATE UNIQUE INDEX "GoldTradeOrder_walletTransactionId_key" ON "GoldTradeOrder"("walletTransactionId");
CREATE INDEX "GoldTradeOrder_userId_createdAt_idx" ON "GoldTradeOrder"("userId", "createdAt");
CREATE INDEX "GoldTradeOrder_userId_side_status_idx" ON "GoldTradeOrder"("userId", "side", "status");
CREATE INDEX "GoldTradeAuditLog_orderId_createdAt_idx" ON "GoldTradeAuditLog"("orderId", "createdAt");
CREATE INDEX "GoldTradeAuditLog_actorId_createdAt_idx" ON "GoldTradeAuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "GoldTradeOrder" ADD CONSTRAINT "GoldTradeOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoldTradeOrder" ADD CONSTRAINT "GoldTradeOrder_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "WalletTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoldTradeAuditLog" ADD CONSTRAINT "GoldTradeAuditLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "GoldTradeOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoldTradeAuditLog" ADD CONSTRAINT "GoldTradeAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
