import { requireActor } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const actor = await requireActor();
  const { orderId } = await params;
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: actor.id },
    include: { store: { select: { name: true, address: true, timezone: true } }, items: { include: { product: { select: { name: true } } } } },
  });
  if (!order) notFound();

  return <main className="min-h-dvh bg-[#f7f1e6] px-4 py-16 sm:px-6"><section className="mx-auto max-w-2xl rounded-3xl bg-[#fffaf0] p-7 text-[#3b2116] shadow-[0_18px_45px_rgba(88,49,22,.08)] sm:p-10"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">Order received</p><h1 className="mt-2 text-3xl font-extrabold">Thanks — we&apos;ll prepare it for pickup.</h1><p className="mt-4 text-[#725b4c]">Order <strong>{order.orderNumber}</strong> is pending confirmation. Pay when you collect it.</p><dl className="mt-7 grid gap-4 rounded-2xl bg-[#f7ebd8] p-5 sm:grid-cols-2"><div><dt className="text-sm text-[#725b4c]">Pickup time</dt><dd className="mt-1 font-bold">{order.pickupTime?.toLocaleString("en-ET", { timeZone: order.store.timezone, dateStyle: "medium", timeStyle: "short" })}</dd></div><div><dt className="text-sm text-[#725b4c]">Location</dt><dd className="mt-1 font-bold">{order.store.name}</dd><dd className="text-sm">{order.store.address}</dd></div></dl><ul className="mt-7 divide-y divide-[#ead9bf]">{order.items.map((item) => <li key={item.id} className="flex justify-between py-3"><span>{item.quantity} × {item.product.name}</span><span className="font-semibold">ETB {item.price.mul(item.quantity).toFixed(2)}</span></li>)}</ul><div className="mt-5 space-y-2 border-t border-[#ead9bf] pt-5 text-right"><p>Subtotal: ETB {order.subtotalAmount.toFixed(2)}</p><p>VAT (15%): ETB {order.taxAmount.toFixed(2)}</p><p className="text-lg font-extrabold">Total: ETB {order.totalAmount.toFixed(2)}</p></div></section></main>;
}
