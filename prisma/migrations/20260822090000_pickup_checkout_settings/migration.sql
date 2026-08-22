-- Pickup-only checkout defaults for K-Coffee.
CREATE TYPE "PaymentMethod" AS ENUM ('PAY_AT_PICKUP');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'VOID');

ALTER TABLE "StoreLocation"
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
  ADD COLUMN "pickupIntervalMinutes" INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN "pickupLeadTimeMinutes" INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN "pickupCapacity" INTEGER NOT NULL DEFAULT 10;

ALTER TABLE "Order"
  ADD COLUMN "subtotalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'ETB',
  ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PAY_AT_PICKUP',
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "idempotencyKey" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Order_storeId_status_pickupTime_idx" ON "Order"("storeId", "status", "pickupTime");
CREATE UNIQUE INDEX "Order_userId_idempotencyKey_key" ON "Order"("userId", "idempotencyKey");
