import { requirePermission } from "@/lib/authz";
import { getStaffOrderAudit } from "@/lib/orders/staff-service";
import { notFound } from "next/navigation";
import Link from "next/link";
import StaffOrderActions from "./staff-order-actions";

const labels: Record<string, string> = { PENDING: "Order received", CONFIRMED: "Confirmed", PREPARING: "Preparing", READY_FOR_PICKUP: "Ready for pickup", COMPLETED: "Collected", CANCELLED: "Cancelled" };

export default async function StaffOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const actor = await requirePermission({ action: "process", resource: "orders" });
  const { orderId } = await params;
  const result = await getStaffOrderAudit(actor, orderId);
  if (!result) notFound();
  const { order, audit } = result;
  return <section className="mx-auto max-w-5xl space-y-7">
    <Link href="/dashboard/cashier" className="text-sm font-semibold text-[#7d4018] underline">← Back to pickup queue</Link>
    <header className="flex flex-col gap-4 rounded-3xl border border-[#ead9bf] bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">{order.store.name}</p><h1 className="mt-2 text-3xl font-extrabold text-[#2c1911]">{order.orderNumber}</h1><p className="mt-2 text-[#725b4c]">{labels[order.status]} · Pay at pickup · ETB {order.totalAmount.toFixed(2)}</p></div><StaffOrderActions orderId={order.id} status={order.status} /></header>
    <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-6"><h2 className="text-lg font-bold text-[#3b2116]">Pickup details</h2><dl className="mt-4 grid gap-4 text-sm"><div><dt className="font-semibold text-[#725b4c]">Customer</dt><dd className="mt-1 font-semibold text-[#3b2116]">{order.user?.name ?? "Pickup customer"}</dd></div><div><dt className="font-semibold text-[#725b4c]">When</dt><dd className="mt-1 text-[#3b2116]">{order.pickupTime ? new Intl.DateTimeFormat("en-ET", { timeZone: order.store.timezone, dateStyle: "medium", timeStyle: "short" }).format(order.pickupTime) : "No pickup time selected"}</dd></div><div><dt className="font-semibold text-[#725b4c]">Location</dt><dd className="mt-1 text-[#3b2116]">{order.store.address}</dd></div>{order.notes && <div><dt className="font-semibold text-[#725b4c]">Customer note</dt><dd className="mt-1 text-[#3b2116]">{order.notes}</dd></div>}</dl></section><section className="rounded-3xl border border-[#ead9bf] bg-white p-6"><h2 className="text-lg font-bold text-[#3b2116]">Order summary</h2><p className="mt-3 text-sm text-[#725b4c]">Subtotal: ETB {order.subtotalAmount.toFixed(2)} · VAT: ETB {order.taxAmount.toFixed(2)}</p><p className="mt-2 font-extrabold text-[#3b2116]">Total: ETB {order.totalAmount.toFixed(2)}</p><ul className="mt-5 divide-y divide-[#ead9bf]">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-4 py-3 text-sm"><span>{item.quantity} × {item.product.name}</span><span className="font-semibold tabular-nums">ETB {item.price.mul(item.quantity).toFixed(2)}</span></li>)}</ul></section></div>
    <section className="rounded-3xl border border-[#ead9bf] bg-white p-6"><h2 className="text-lg font-bold text-[#3b2116]">Order activity</h2><ol className="mt-4 divide-y divide-[#ead9bf]">{audit.map((event) => <li key={event.id} className="py-4 text-sm"><p className="font-semibold text-[#3b2116]">{event.action.replaceAll("_", " ")} · {event.user?.name ?? event.userRole}</p><p className="mt-1 text-[#725b4c]">{new Intl.DateTimeFormat("en-ET", { timeZone: order.store.timezone, dateStyle: "medium", timeStyle: "short" }).format(event.createdAt)}</p></li>)}{!audit.length && <li className="py-4 text-sm text-[#725b4c]">No operational activity has been recorded yet.</li>}</ol></section>
  </section>;
}
