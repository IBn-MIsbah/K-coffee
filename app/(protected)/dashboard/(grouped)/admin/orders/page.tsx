import Link from "next/link";
import { requirePermission } from "@/lib/authz";
import { getAdminOrderOperations } from "@/lib/orders/admin-order-service";
import { AdminOrderFilterError, parseAdminOrderFilters } from "@/lib/orders/admin-order-validation";
import { OrderStatus } from "@/app/generated/prisma/client";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const actor = await requirePermission({ action: "manage", resource: "orders" });
  const params = await searchParams;
  let error = "";
  let filters;

  try {
    filters = parseAdminOrderFilters(params);
  } catch (cause) {
    error = cause instanceof AdminOrderFilterError ? cause.message : "The order filters are invalid.";
    filters = parseAdminOrderFilters({});
  }

  const { orders, stores, hasNextPage } = await getAdminOrderOperations(actor, filters);
  const pageUrl = (page: number) => {
    const next = new URLSearchParams();
    if (filters.storeId) next.set("storeId", filters.storeId);
    if (filters.status) next.set("status", filters.status);
    if (filters.query) next.set("query", filters.query);
    if (filters.from) next.set("from", filters.from);
    if (filters.to) next.set("to", filters.to);
    next.set("page", String(page));
    return `/dashboard/admin/orders?${next.toString()}`;
  };

  return <section className="mx-auto max-w-7xl space-y-6">
    <header>
      <p className="text-sm font-semibold text-amber-700">Operations</p>
      <h1 className="mt-1 text-3xl font-bold text-amber-950">Order operations</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Review pickup orders with Ethiopia-local dates. These figures are operational only and are not an accounting reconciliation.</p>
    </header>

    <form className="grid gap-4 rounded-3xl border border-[#ead9bf] bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-3" action="/dashboard/admin/orders">
      <input type="hidden" name="page" value="1" />
      <Field label="Order number or customer name" htmlFor="query"><input id="query" name="query" defaultValue={filters.query} className={fieldClass} placeholder="Exact match" /></Field>
      <Field label="Store" htmlFor="storeId"><select id="storeId" name="storeId" defaultValue={filters.storeId ?? ""} className={fieldClass}><option value="">All stores</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}{store.isActive ? "" : " (archived)"}</option>)}</select></Field>
      <Field label="Status" htmlFor="status"><select id="status" name="status" defaultValue={filters.status ?? ""} className={fieldClass}><option value="">All statuses</option>{Object.values(OrderStatus).map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></Field>
      <Field label="From date (Ethiopia)" htmlFor="from"><input id="from" name="from" type="date" defaultValue={filters.from} className={fieldClass} /></Field>
      <Field label="To date (Ethiopia)" htmlFor="to"><input id="to" name="to" type="date" defaultValue={filters.to} className={fieldClass} /></Field>
      <div className="flex items-end gap-3"><button type="submit" className="min-h-11 rounded-xl bg-amber-700 px-5 font-bold text-white hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800">Apply filters</button><Link href="/dashboard/admin/orders" className="inline-flex min-h-11 items-center rounded-xl px-4 font-semibold text-amber-800 underline hover:bg-amber-50">Clear</Link></div>
      <p className="text-sm text-slate-600 lg:col-span-3">Search uses an exact order number or customer-name match. Date ranges are limited to 93 days.</p>
      {error && <p role="alert" className="text-sm font-medium text-red-700 lg:col-span-3">{error}</p>}
    </form>

    <section className="overflow-hidden rounded-3xl border border-[#ead9bf] bg-white shadow-sm">
      <div className="border-b border-[#ead9bf] px-5 py-4"><h2 className="text-lg font-bold text-amber-950">Matching orders</h2></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#fffaf0] text-xs uppercase tracking-wide text-[#725b4c]"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Store</th><th className="px-5 py-3">Pickup time</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-[#ead9bf]">{orders.map((order) => <tr key={order.id}><td className="px-5 py-4 font-mono font-semibold text-[#3b2116]">{order.orderNumber}<span className="mt-1 block font-sans text-xs font-normal text-[#725b4c]">Created {new Intl.DateTimeFormat("en-ET", { timeZone: "Africa/Addis_Ababa", dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}</span></td><td className="px-5 py-4 text-[#3b2116]">{order.store.name}</td><td className="px-5 py-4 text-[#3b2116]">{order.pickupTime ? new Intl.DateTimeFormat("en-ET", { timeZone: order.store.timezone, dateStyle: "medium", timeStyle: "short" }).format(order.pickupTime) : "Not scheduled"}</td><td className="px-5 py-4"><span className="font-semibold text-[#3b2116]">{order.status.replaceAll("_", " ")}</span><span className="mt-1 block text-xs text-[#725b4c]">{order.paymentStatus.replaceAll("_", " ")}</span></td><td className="px-5 py-4 text-right font-bold tabular-nums text-[#3b2116]">ETB {order.totalAmount.toFixed(2)}</td></tr>)}{!orders.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-600">No orders match these filters.</td></tr>}</tbody></table></div>
      <nav aria-label="Order result pages" className="flex items-center justify-between gap-4 border-t border-[#ead9bf] px-5 py-4"><p className="text-sm text-slate-600">Page {filters.page}</p><div className="flex gap-2">{filters.page > 1 && <Link href={pageUrl(filters.page - 1)} className="inline-flex min-h-11 items-center rounded-xl border border-[#d8bc9a] px-4 font-semibold text-[#3b2116] hover:bg-[#fffaf0]">Previous</Link>}{hasNextPage && <Link href={pageUrl(filters.page + 1)} className="inline-flex min-h-11 items-center rounded-xl border border-[#d8bc9a] px-4 font-semibold text-[#3b2116] hover:bg-[#fffaf0]">Next</Link>}</div></nav>
    </section>
  </section>;
}

const fieldClass = "min-h-11 w-full rounded-xl border border-[#d8bc9a] bg-white px-3 text-base text-[#3b2116] shadow-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-200";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="grid gap-2 text-sm font-semibold text-[#3b2116]">{label}{children}</label>;
}
