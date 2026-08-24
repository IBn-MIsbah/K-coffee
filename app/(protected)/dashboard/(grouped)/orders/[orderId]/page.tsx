import { requirePageRole } from "@/lib/authz";
import { canCustomerCancel, getCustomerOrder } from "@/lib/orders/customer-service";
import CustomerOrderCancelButton from "@/components/orders/CustomerOrderCancelButton";
import CustomerOrderReorderButton from "@/components/orders/CustomerOrderReorderButton";
import { UserRole } from "@/lib/rbac";
import Link from "next/link";
import { notFound } from "next/navigation";
const steps = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "COMPLETED",
];
const labels: Record<string, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  PREPARING: "Being prepared",
  READY_FOR_PICKUP: "Ready for pickup",
  COMPLETED: "Collected",
  CANCELLED: "Cancelled",
};
export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const actor = await requirePageRole([UserRole.USER], "/dashboard/orders");
  const { orderId } = await params;
  const order = await getCustomerOrder(actor, orderId);
  if (!order) notFound();
  const current = steps.indexOf(order.status);
  const canCancel = canCustomerCancel(actor, order);
  return (
    <section className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/orders"
        className="text-sm font-semibold text-[#7d4018] underline"
      >
        ← Back to orders
      </Link>
      <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#a56328]">
        Order {order.orderNumber}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#2c1911]">
        {labels[order.status]}
      </h1>
      <p className="mt-2 text-[#725b4c]">
        Pay at pickup · ETB {order.totalAmount.toFixed(2)}
      </p>
      {canCancel && <div className="mt-5"><CustomerOrderCancelButton orderId={order.id} /></div>}
      {(order.status === "COMPLETED" || order.status === "CANCELLED") && <div className="mt-5"><CustomerOrderReorderButton orderId={order.id} /></div>}
      <ol className="mt-7 grid gap-3 sm:grid-cols-5">
        {steps.map((step, index) => {
          const complete = order.status !== "CANCELLED" && index <= current;
          return (
            <li
              key={step}
              className={`rounded-xl border p-3 text-sm ${complete ? "border-[#c9853c] bg-[#f5dfba] text-[#3b2116]" : "border-[#ead9bf] bg-[#fffaf0] text-[#725b4c]"}`}
            >
              <span className="block text-xs font-bold">{index + 1}</span>
              {labels[step]}
            </li>
          );
        })}
      </ol>
      {order.status === "CANCELLED" && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-[#7e271d]">
          This order was cancelled and no payment is due.
        </p>
      )}
      {order.status !== "CANCELLED" && <aside className="mt-5 rounded-xl border border-[#ead9bf] bg-white p-4 text-sm text-[#725b4c]"><p className="font-bold text-[#3b2116]">Need help with this pickup?</p><p className="mt-1">Have your order number ready and speak with the store team at pickup. Online support contacts will be added before production launch.</p></aside>}
      <div className="mt-7 grid gap-5 rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-6 sm:grid-cols-2">
        <div>
          <h2 className="font-bold text-[#3b2116]">Pickup</h2>
          <p className="mt-2 font-semibold">{order.store.name}</p>
          <p className="text-sm text-[#725b4c]">{order.store.address}</p>
          <p className="mt-3 text-sm">
            {order.pickupTime?.toLocaleString("en-ET", {
              timeZone: order.store.timezone,
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div>
          <h2 className="font-bold text-[#3b2116]">Summary</h2>
          <p className="mt-2 text-sm">
            Subtotal: ETB {order.subtotalAmount.toFixed(2)}
          </p>
          <p className="text-sm">VAT (15%): ETB {order.taxAmount.toFixed(2)}</p>
          <p className="mt-2 font-extrabold">
            Total: ETB {order.totalAmount.toFixed(2)}
          </p>
        </div>
      </div>
      <ul className="mt-6 divide-y divide-[#ead9bf] rounded-2xl border border-[#ead9bf] bg-[#fffaf0] px-5">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-4">
            <span>
              {item.quantity} × {item.product.name}
            </span>
            <span className="font-semibold">
              ETB {item.price.mul(item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
