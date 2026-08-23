"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const next: Record<string, string | undefined> = { PENDING: "CONFIRMED", CONFIRMED: "PREPARING", PREPARING: "READY_FOR_PICKUP", READY_FOR_PICKUP: "COMPLETED" };

type QueueOrder = {
  id: string;
  orderNumber: string;
  status: string;
  itemCount: number;
  pickupTime: string | null;
  timezone: string;
};

export default function CashierQueue({ orders }: { orders: QueueOrder[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function advance(id: string, status: string) {
    setBusy(id);

    try {
      const response = await fetch(`/api/staff/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextStatus: status }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Unable to update this order.");

      toast.success(`Order marked ${status.replaceAll("_", " ")}`);
      router.refresh();
    } catch (error) {
      toast.error("Order could not be updated", {
        description: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setBusy(null);
    }
  }

  return <section className="mx-auto max-w-6xl">
    <p className="text-sm font-semibold text-amber-700">Staff workspace</p>
    <h1 className="mt-1 text-3xl font-bold text-amber-950">Pickup queue</h1>
    <p className="mt-2 text-slate-600">Only orders assigned to your store are shown.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => <article key={order.id} className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="font-mono text-sm font-bold">{order.orderNumber}</p>
        <p className="mt-2 font-semibold">{order.status.replaceAll("_", " ")}</p>
        <p className="mt-2 text-sm text-slate-600">
          {order.itemCount} items · {order.pickupTime
            ? new Intl.DateTimeFormat("en-ET", { timeZone: order.timezone, timeStyle: "short" }).format(new Date(order.pickupTime))
            : "No pickup time"}
        </p>
        <div className="mt-5 grid gap-2">
          {next[order.status] && <Button className="min-h-11 w-full" disabled={busy === order.id} onClick={() => advance(order.id, next[order.status]!)}>
            {busy === order.id ? "Updating…" : `Mark ${next[order.status]!.replaceAll("_", " ")}`}
          </Button>}
          <Button asChild variant="outline" className="min-h-11 w-full">
            <Link href={`/dashboard/cashier/orders/${order.id}`}>View order</Link>
          </Button>
        </div>
      </article>)}
    </div>
    {!orders.length && <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-slate-600">No active pickup orders are assigned to this store.</div>}
  </section>;
}
