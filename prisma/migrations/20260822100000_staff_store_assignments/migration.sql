CREATE TABLE "StaffStoreAssignment" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "storeId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StaffStoreAssignment_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "StaffStoreAssignment_userId_storeId_key" ON "StaffStoreAssignment"("userId", "storeId");
CREATE INDEX "StaffStoreAssignment_storeId_idx" ON "StaffStoreAssignment"("storeId");
ALTER TABLE "StaffStoreAssignment" ADD CONSTRAINT "StaffStoreAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffStoreAssignment" ADD CONSTRAINT "StaffStoreAssignment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "StoreLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
