"use client";

import CustomerOrderCancelButton from "@/components/orders/CustomerOrderCancelButton";
import Link from "next/link";

type Order = {
  id: string;
  number: string;
  status: string;
  total: string;
  items: number;
  pickup: string | null;
  timezone: string;
  store: string;
  canCancel: boolean;
};

const viewLabels = { ACTIVE: "Active", COMPLETED: "Completed", CANCELLED: "Cancelled", ALL: "All orders" };

export default function OrderList({ orders, view, error }: { orders: Order[]; view: keyof typeof viewLabels; error: string }) {
  return <section className="mx-auto max-w-5xl">
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a56328]">Your orders</p>
    <h1 className="mt-2 text-3xl font-extrabold text-[#2c1911]">Order history</h1>
    <nav aria-label="Order history filters" className="mt-5 flex flex-wrap gap-2">
      {Object.entries(viewLabels).map(([value, label]) => <Link key={value} href={value === "ACTIVE" ? "/dashboard/orders" : `/dashboard/orders?view=${value}`} className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold ${view === value ? "bg-[#7d4018] text-white" : "border border-[#dfc6a9] bg-white text-[#3b2116] hover:bg-[#f7ebd8]"}`}>{label}</Link>)}
    </nav>
    {error && <p role="alert" className="mt-4 text-sm text-[#7e271d]">{error}</p>}
    <div className="mt-7 grid gap-4">
      {orders.map((order) => <article key={order.id} className="rounded-2xl border border-[#ead9bf] bg-[#fffaf0] p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="min-w-0">
            <Link className="font-mono font-bold text-[#7d4018] underline" href={`/dashboard/orders/${order.id}`}>{order.number}</Link>
            <p className="mt-1 text-sm text-[#725b4c]">{order.store} · {order.items} items{order.pickup ? ` · ${new Intl.DateTimeFormat("en-ET", { timeZone: order.timezone, dateStyle: "medium", timeStyle: "short" }).format(new Date(order.pickup))}` : ""}</p>
          </div>
          <div className="text-right">
            <p className="font-bold tabular-nums">ETB {order.total}</p>
            <p className="mt-1 text-sm font-semibold text-[#7d4018]">{order.status.replaceAll("_", " ")}</p>
          </div>
        </div>
        {order.canCancel && <div className="mt-4"><CustomerOrderCancelButton orderId={order.id} /></div>}
      </article>)}
      {!orders.length && <div className="rounded-2xl border border-dashed border-[#dfc6a9] p-10 text-center text-[#725b4c]">No {viewLabels[view].toLowerCase()} yet. Your pickup orders will appear here.</div>}
    </div>
  </section>;
}
