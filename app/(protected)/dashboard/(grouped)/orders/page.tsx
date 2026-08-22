import { requireActor } from "@/lib/authz";
import {
  canCustomerCancel,
  listCustomerOrders,
} from "@/lib/orders/customer-service";
import OrderList from "./order-list";
export default async function OrdersPage() {
  const actor = await requireActor();
  const orders = await listCustomerOrders(actor);
  return (
    <OrderList
      orders={orders.map((o) => ({
        id: o.id,
        number: o.orderNumber,
        status: o.status,
        total: o.totalAmount.toFixed(2),
        items: o.items.reduce((n, i) => n + i.quantity, 0),
        pickup: o.pickupTime?.toISOString() ?? null,
        timezone: o.store.timezone,
        store: o.store.name,
        created: o.createdAt.toISOString(),
        canCancel: canCustomerCancel(actor, o),
      }))}
    />
  );
}
