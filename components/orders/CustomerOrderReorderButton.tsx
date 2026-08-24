"use client";

import { Button } from "@/components/ui/button";
import { type CartItem, useCart } from "@/lib/store/useCart";
import { RotateCcw, ShoppingCart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Preview = {
  available: CartItem[];
  unavailable: { productId: string; name: string; quantity: number; reason: string }[];
};

export default function CustomerOrderReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const replaceItems = useCart((state) => state.replaceItems);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [replacing, setReplacing] = useState(false);

  async function previewOrder() {
    setLoading(true);
    try {
      const response = await fetch(`/api/account/orders/${orderId}/reorder`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to prepare this order again.");
      setPreview({
        available: data.available.map((item: CartItem & { price: string | number }) => ({ ...item, price: Number(item.price) })),
        unavailable: data.unavailable,
      });
    } catch (error) {
      toast.error("Order could not be prepared", { description: error instanceof Error ? error.message : "Try again shortly." });
    } finally {
      setLoading(false);
    }
  }

  async function replaceCart() {
    if (!preview?.available.length) return;
    setReplacing(true);
    try {
      const authorization = await fetch("/api/cart/authorize", { method: "POST" });
      if (!authorization.ok) throw new Error("Your cart session could not be verified. Please sign in again.");

      replaceItems(preview.available);
      toast.success("Cart replaced with your previous order", {
        description: `${preview.available.length} ${preview.available.length === 1 ? "item is" : "items are"} ready for checkout.`,
        action: { label: "View cart", onClick: () => router.push("/cart") },
      });
      setPreview(null);
    } catch (error) {
      toast.error("Cart was not changed", { description: error instanceof Error ? error.message : "Try again shortly." });
    } finally {
      setReplacing(false);
    }
  }

  if (!preview) return <Button variant="outline" onClick={previewOrder} disabled={loading} className="min-h-11 border-[#c9853c] text-[#6d3514] hover:bg-[#f7ebd8] hover:text-[#3b2116]"><RotateCcw aria-hidden="true" className="size-4" />{loading ? "Checking menu…" : "Order again"}</Button>;

  return <section aria-live="polite" className="mt-4 rounded-2xl border border-[#dfc6a9] bg-white p-4 text-left shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-[#3b2116]">Replace your cart?</h3><p className="mt-1 text-sm leading-6 text-[#725b4c]">Your current cart will be replaced with currently available items and their current prices.</p></div><Button type="button" variant="ghost" size="icon" onClick={() => setPreview(null)} aria-label="Close order-again preview" className="shrink-0 text-[#725b4c] hover:bg-[#f7ebd8]"><X aria-hidden="true" className="size-4" /></Button></div>
    {preview.available.length > 0 && <ul className="mt-4 space-y-2 text-sm text-[#3b2116]">{preview.available.map((item) => <li key={item.productId} className="flex justify-between gap-3"><span>{item.quantity} × {item.name}</span><span className="shrink-0 font-semibold tabular-nums">ETB {(item.price * item.quantity).toFixed(2)}</span></li>)}</ul>}
    {preview.unavailable.length > 0 && <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-[#784721]"><p className="font-bold">Unavailable items will not be added</p><ul className="mt-1 list-disc pl-5">{preview.unavailable.map((item) => <li key={item.productId}>{item.quantity} × {item.name} — {item.reason}</li>)}</ul></div>}
    {!preview.available.length && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-[#7e271d]">None of the items in this order are currently available. Browse the menu to start a new order.</p>}
    <div className="mt-5 flex flex-wrap gap-2"><Button onClick={replaceCart} disabled={!preview.available.length || replacing} className="min-h-11 bg-[#b56527] font-bold text-white hover:bg-[#934817]"><ShoppingCart aria-hidden="true" className="size-4" />{replacing ? "Replacing cart…" : "Replace cart"}</Button><Button type="button" variant="outline" onClick={() => setPreview(null)} disabled={replacing} className="min-h-11 border-[#dfc6a9]">Keep current cart</Button></div>
  </section>;
}
