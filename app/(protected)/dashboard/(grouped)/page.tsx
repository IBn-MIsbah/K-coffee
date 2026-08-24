import CustomerOrderCancelButton from "@/components/orders/CustomerOrderCancelButton";
import { Button } from "@/components/ui/button";
import { requirePageSession } from "@/lib/authz";
import { getCustomerDashboard } from "@/lib/dashboard/customer-dashboard-service";
import { canCustomerCancel } from "@/lib/orders/customer-service";
import { UserRole } from "@/lib/rbac";
import { ArrowRight, CalendarClock, MapPin, ReceiptText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CustomerDashboardActions from "./customer-dashboard-actions";

const statusLabels = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  PREPARING: "Being prepared",
  READY_FOR_PICKUP: "Ready for pickup",
  COMPLETED: "Collected",
  CANCELLED: "Cancelled",
} as const;

function orderItemCount(order: { items: { quantity: number }[] }) {
  return order.items.reduce((count, item) => count + item.quantity, 0);
}

export default async function CustomerDashboardPage() {
  const actor = await requirePageSession("/dashboard");

  if (actor.role === UserRole.ADMIN || actor.role === UserRole.SUPERADMIN) redirect("/dashboard/admin");
  if (actor.role === UserRole.CASHIER) redirect("/dashboard/cashier");
  if (actor.role !== UserRole.USER) redirect("/unauthorized");

  const { activeOrder, recentOrders } = await getCustomerDashboard(actor);
  const firstName = actor.name?.trim().split(/\s+/)[0] || "there";

  return <section className="mx-auto w-full max-w-6xl">
    <header className="rounded-3xl bg-[#3b2116] px-6 py-8 text-[#fff9ee] shadow-[0_18px_45px_rgba(60,32,17,.18)] sm:px-8 sm:py-10">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f4bd4d]">Customer home</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">Good to see you, {firstName}.</h2>
      <p className="mt-3 max-w-2xl text-[#e9ca9e]">Manage your pickup, browse today&apos;s menu, or continue where you left off.</p>
      <div className="mt-6"><CustomerDashboardActions /></div>
    </header>

    <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,.85fr)]">
      <section aria-labelledby="active-order-heading" className="rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-5 shadow-[0_18px_45px_rgba(88,49,22,.08)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">Pickup status</p><h2 id="active-order-heading" className="mt-2 text-2xl font-extrabold text-[#2c1911]">{activeOrder ? statusLabels[activeOrder.status] : "No active pickup"}</h2></div>
          {activeOrder && <span className="rounded-full bg-[#f5dfba] px-3 py-1 text-sm font-bold text-[#784721]">{activeOrder.status.replaceAll("_", " ")}</span>}
        </div>

        {activeOrder ? <div className="mt-6">
          <p className="font-mono text-sm font-bold text-[#7d4018]">{activeOrder.orderNumber}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DashboardDetail icon={CalendarClock} label="Pickup time" value={activeOrder.pickupTime ? new Intl.DateTimeFormat("en-ET", { timeZone: activeOrder.store.timezone, dateStyle: "medium", timeStyle: "short" }).format(activeOrder.pickupTime) : "Pickup time will be confirmed by the store."} />
            <DashboardDetail icon={MapPin} label="Pickup location" value={`${activeOrder.store.name} · ${activeOrder.store.address}`} />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#ead9bf] pt-5">
            <p className="text-sm text-[#725b4c]">{orderItemCount(activeOrder)} {orderItemCount(activeOrder) === 1 ? "item" : "items"} · <span className="font-bold text-[#3b2116]">ETB {activeOrder.totalAmount.toFixed(2)}</span> · Pay at pickup</p>
            <div className="flex flex-wrap gap-2"><Button asChild variant="outline" className="min-h-11 rounded-xl border-[#c9853c] bg-white text-[#6d3514] hover:bg-[#f7ebd8] hover:text-[#3b2116]"><Link href={`/dashboard/orders/${activeOrder.id}`}>View order <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>{canCustomerCancel(actor, activeOrder) && <CustomerOrderCancelButton orderId={activeOrder.id} />}</div>
          </div>
        </div> : <div className="mt-6 rounded-2xl border border-dashed border-[#dfc6a9] bg-white p-6"><p className="font-bold text-[#3b2116]">Your next coffee is waiting.</p><p className="mt-2 max-w-xl text-sm leading-6 text-[#725b4c]">Choose from the menu, then select a store and an available 20-minute pickup slot at checkout.</p><Button asChild className="mt-5 min-h-11 rounded-xl bg-[#b56527] font-bold text-white hover:bg-[#934817]"><Link href="/menu">Browse the menu <ArrowRight aria-hidden="true" className="size-4" /></Link></Button></div>}
      </section>

      <section aria-labelledby="recent-orders-heading" className="rounded-3xl border border-[#ead9bf] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">History</p><h2 id="recent-orders-heading" className="mt-2 text-xl font-extrabold text-[#2c1911]">Recent orders</h2></div><ReceiptText aria-hidden="true" className="size-5 text-[#a56328]" /></div>
        {recentOrders.length ? <ul className="mt-5 divide-y divide-[#ead9bf]">{recentOrders.map((order) => <li key={order.id} className="py-4 first:pt-0 last:pb-0"><Link href={`/dashboard/orders/${order.id}`} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#934817]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-sm font-bold text-[#7d4018]">{order.orderNumber}</p><p className="mt-1 text-sm text-[#725b4c]">{order.store.name} · {orderItemCount(order)} {orderItemCount(order) === 1 ? "item" : "items"}</p></div><div className="shrink-0 text-right"><p className="font-bold tabular-nums text-[#3b2116]">ETB {order.totalAmount.toFixed(2)}</p><p className="mt-1 text-xs font-semibold text-[#725b4c]">{statusLabels[order.status]}</p></div></div></Link></li>)}</ul> : <p className="mt-5 rounded-2xl bg-[#f7f1e6] p-5 text-sm leading-6 text-[#725b4c]">Completed and cancelled pickup orders will appear here.</p>}
        <Button asChild variant="ghost" className="mt-5 min-h-11 w-full justify-between text-[#7d4018] hover:bg-[#f7ebd8] hover:text-[#3b2116]"><Link href="/dashboard/orders">View all orders <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
      </section>
    </div>
  </section>;
}

function DashboardDetail({ icon: Icon, label, value }: { icon: typeof CalendarClock; label: string; value: string }) {
  return <div className="flex gap-3 rounded-2xl bg-white p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f5dfba] text-[#7d4018]"><Icon aria-hidden="true" className="size-5" /></span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#a56328]">{label}</p><p className="mt-1 wrap-break-word text-sm font-semibold leading-6 text-[#3b2116]">{value}</p></div></div>;
}
