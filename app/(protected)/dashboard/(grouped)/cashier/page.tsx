import { requirePermission } from "@/lib/authz";
import { getStaffQueue } from "@/lib/orders/staff-service";
import CashierQueue from "./queue";

const CashierDashboard = async () => {
  const actor = await requirePermission({ action: "process", resource: "orders" });
  const orders = await getStaffQueue(actor);
  return <CashierQueue orders={orders.map((order) => ({ id: order.id, orderNumber: order.orderNumber, status: order.status, itemCount: order.items.reduce((total, item) => total + item.quantity, 0), pickupTime: order.pickupTime?.toISOString() ?? null, timezone: order.store.timezone }))} />;
};

export default CashierDashboard;
