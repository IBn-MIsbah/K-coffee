import { requirePermission } from "@/lib/authz";
import { getAdminOrderMetrics } from "@/lib/orders/admin-metrics";
import prisma from "@/lib/prisma";
import ProductList from "./product-list";

const AdminDashboard = async () => {
  await requirePermission({ action: "manage", resource: "orders" });
  const [metrics, products] = await Promise.all([getAdminOrderMetrics(), prisma.product.findMany({ include: { category: { select: { name: true } } }, orderBy: { name: "asc" } })]);
  return <section className="mx-auto max-w-6xl"><p className="text-sm font-semibold text-amber-700">Operations</p><h1 className="mt-1 text-3xl font-bold text-amber-950">Admin overview</h1><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Sales (ETB)" value={metrics.salesTotal} /><Metric label="Active orders" value={metrics.orderCount.toString()} />{["PENDING", "PREPARING"].map((status) => <Metric key={status} label={status.replaceAll("_", " ")} value={(metrics.byStatus[status] ?? 0).toString()} />)}</div><section className="mt-8 rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold text-amber-950">Recent orders</h2><div className="mt-4 divide-y">{metrics.recent.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span className="font-mono font-semibold">{order.orderNumber}</span><span>{order.store.name}</span><span>{order.status.replaceAll("_", " ")}</span><span className="font-semibold tabular-nums">ETB {order.totalAmount.toFixed(2)}</span></div>)}{!metrics.recent.length && <p className="py-6 text-slate-600">No orders yet.</p>}</div></section><ProductList products={products.map((product) => ({ id: product.id, name: product.name, price: product.price.toFixed(2), isActive: product.isActive, category: product.category.name }))} /></section>;
};
function Metric({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-2xl font-bold tabular-nums text-amber-950">{value}</p></article>; }

export default AdminDashboard;
