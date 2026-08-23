"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const next: Record<string, string | undefined> = { PENDING: "CONFIRMED", CONFIRMED: "PREPARING", PREPARING: "READY_FOR_PICKUP", READY_FOR_PICKUP: "COMPLETED" };

export default function StaffOrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const target = next[status];

  if (!target) return <p className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">{status.replaceAll("_", " ")}</p>;

  const nextStatus = target;

  async function advance() {
    setBusy(true);

    try {
      const response = await fetch(`/api/staff/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextStatus }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Unable to update the order.");

      toast.success(`Order marked ${nextStatus.replaceAll("_", " ")}`);
      router.refresh();
    } catch (error) {
      toast.error("Order could not be updated", {
        description: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setBusy(false);
    }
  }

  return <Button disabled={busy} onClick={advance} className="min-h-11 rounded-full bg-amber-700 text-white hover:bg-amber-800">
    {busy ? "Updating…" : `Mark ${nextStatus.replaceAll("_", " ")}`}
  </Button>;
}
