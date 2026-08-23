import { requirePageRole } from "@/lib/authz";
import {
  canCustomerCancel,
  listCustomerOrders,
} from "@/lib/orders/customer-service";
import { CustomerOrderHistoryFilterError, parseCustomerOrderHistoryFilters } from "@/lib/orders/customer-order-validation";
import OrderList from "./order-list";
import { UserRole } from "@/lib/rbac";
export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requirePageRole([UserRole.USER], "/dashboard/orders");
  const params = await searchParams;
  let error = "";
  let filters;
  try {
    filters = parseCustomerOrderHistoryFilters(params);
  } catch (cause) {
    error = cause instanceof CustomerOrderHistoryFilterError ? cause.message : "The order-history filter is invalid.";
    filters = parseCustomerOrderHistoryFilters({});
  }
  const orders = await listCustomerOrders(actor, filters);
  return (
    <OrderList
      view={filters.view}
      error={error}
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
