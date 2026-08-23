"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CustomerOrderCancelButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function cancel() {
    if (!window.confirm("Cancel this pickup order? This cannot be undone.")) return;
    setBusy(true);

    try {
      const response = await fetch(`/api/account/orders/${orderId}/cancel`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to cancel this order.");

      toast.success("Order cancelled", { description: "No payment is due for this pickup order." });
      router.refresh();
    } catch (error) {
      toast.error("Order could not be cancelled", {
        description: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setBusy(false);
    }
  }

  return <Button variant="outline" disabled={busy} onClick={cancel} className="min-h-11 border-red-200 text-[#7e271d] hover:bg-red-50 hover:text-[#7e271d]">
    {busy ? "Cancelling…" : "Cancel order"}
  </Button>;
}
