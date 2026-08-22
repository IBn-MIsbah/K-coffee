"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function OrderList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function cancel(id: string) {
    if (!confirm("Cancel this pickup order?")) return;
    setBusy(id);
    setError("");
    const response = await fetch(`/api/account/orders/${id}/cancel`, {
      method: "POST",
    });
    if (response.ok) router.refresh();
    else
      setError((await response.json()).error ?? "Unable to cancel this order.");
    setBusy(null);
  }
  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a56328]">
        Your orders
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#2c1911]">
        Order history
      </h1>
      {error && (
        <p role="alert" className="mt-4 text-sm text-[#7e271d]">
          {error}
        </p>
      )}
      <div className="mt-7 grid gap-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-[#ead9bf] bg-[#fffaf0] p-5"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <Link
                  className="font-mono font-bold text-[#7d4018] underline"
                  href={`/dashboard/orders/${order.id}`}
                >
                  {order.number}
                </Link>
                <p className="mt-1 text-sm text-[#725b4c]">
                  {order.store} · {order.items} items
                  {order.pickup
                    ? ` · ${new Intl.DateTimeFormat("en-ET", { timeZone: order.timezone, dateStyle: "medium", timeStyle: "short" }).format(new Date(order.pickup))}`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">ETB {order.total}</p>
                <p className="mt-1 text-sm font-semibold text-[#7d4018]">
                  {order.status.replaceAll("_", " ")}
                </p>
              </div>
            </div>
            {order.canCancel && (
              <Button
                variant="outline"
                disabled={busy === order.id}
                onClick={() => cancel(order.id)}
                className="mt-4 min-h-11"
              >
                {busy === order.id ? "Cancelling…" : "Cancel order"}
              </Button>
            )}
          </article>
        ))}
        {!orders.length && (
          <div className="rounded-2xl border border-dashed border-[#dfc6a9] p-10 text-center text-[#725b4c]">
            No orders yet. Your pickup orders will appear here.
          </div>
        )}
      </div>
    </section>
  );
}
