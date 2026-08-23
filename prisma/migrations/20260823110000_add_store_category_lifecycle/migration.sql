-- Add non-destructive lifecycle and traceability fields for F3 administration.
ALTER TABLE "Category"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "StoreLocation"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Prisma maintains @updatedAt in application writes. The temporary defaults above
-- only backfill existing rows during this migration.
ALTER TABLE "Category" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "StoreLocation" ALTER COLUMN "updatedAt" DROP DEFAULT;
