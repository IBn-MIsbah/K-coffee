-- Keep this migration after add_customer_notifications. The base notification
-- tables must exist before optional product references can be added.
ALTER TABLE "AppNotification" ADD COLUMN "productId" TEXT;
ALTER TABLE "NotificationDelivery" ADD COLUMN "productId" TEXT;

ALTER TABLE "AppNotification"
  ADD CONSTRAINT "AppNotification_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NotificationDelivery"
  ADD CONSTRAINT "NotificationDelivery_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
