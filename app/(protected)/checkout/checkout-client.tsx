"use client";

import { Button } from "@/components/ui/button";
import { getCartSubtotal, useCart } from "@/lib/store/useCart";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Store = { id: string; name: string; address: string; timezone: string; pickupIntervalMinutes: number; pickupLeadTimeMinutes: number };

function makeSlots(store: Store) {
  const now = Date.now() + store.pickupLeadTimeMinutes * 60_000;
  const slots: { value: string; label: string }[] = [];
  const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: store.timezone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const localDate = new Date(Date.now() + dayOffset * 86_400_000);
    const [year, month, day] = new Intl.DateTimeFormat("en-CA", { timeZone: store.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(localDate).split("-").map(Number);
    for (let minute = 7 * 60; minute < 19 * 60; minute += store.pickupIntervalMinutes) {
      const value = new Date(Date.UTC(year, month - 1, day, Math.floor(minute / 60) - 3, minute % 60));
      if (value.getTime() >= now) slots.push({ value: value.toISOString(), label: formatter.format(value) });
    }
  }
  return slots;
}

export default function CheckoutClient({ stores }: { stores: Store[] }) {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);
  const [storeId, setStoreId] = useState(stores[0].id);
  const store = stores.find((value) => value.id === storeId) ?? stores[0];
  const slots = useMemo(() => makeSlots(store), [store]);
  const [pickupTime, setPickupTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const subtotal = getCartSubtotal(items);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  async function submit() {
    setError("");
    if (!items.length) return setError("Your cart is empty.");
    if (!pickupTime) return setError("Choose a pickup time.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId, pickupTime, notes, idempotencyKey: crypto.randomUUID(), items: items.map(({ productId, quantity }) => ({ productId, quantity })) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Checkout failed.");
      clearCart();
      router.push(`/orders/${result.order.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout failed.");
    } finally { setSubmitting(false); }
  }

  return <main className="min-h-dvh bg-[#f7f1e6] px-4 py-12 sm:px-6"><div className="mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">Pickup checkout</p><h1 className="mt-2 text-3xl font-extrabold text-[#2c1911]">Confirm your order</h1><p className="mt-2 text-[#725b4c]">Pay at pickup. All times are in Ethiopia time.</p><div className="mt-8 grid gap-6 md:grid-cols-[1fr_18rem]"><section className="rounded-3xl bg-[#fffaf0] p-6 shadow-sm"><label className="block text-sm font-bold text-[#3b2116]">Pickup location<select value={storeId} onChange={(event) => { setStoreId(event.target.value); setPickupTime(""); }} className="mt-2 min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-white px-3"><option value={store.id}>{store.name} — {store.address}</option>{stores.filter((item) => item.id !== store.id).map((item) => <option key={item.id} value={item.id}>{item.name} — {item.address}</option>)}</select></label><label className="mt-5 block text-sm font-bold text-[#3b2116]">20-minute pickup slot<select value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-white px-3"><option value="">Select a time</option>{slots.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}</select></label><label className="mt-5 block text-sm font-bold text-[#3b2116]">Order note <span className="font-normal text-[#725b4c]">(optional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} className="mt-2 min-h-24 w-full rounded-xl border border-[#dfc6a9] bg-white p-3" /></label>{error && <p role="alert" className="mt-4 text-sm text-[#9b3b2d]">{error}</p>}<Button onClick={submit} disabled={submitting || !items.length} className="mt-6 min-h-12 w-full rounded-full bg-[#b56527] font-bold hover:bg-[#934817]">{submitting ? "Placing order…" : "Place pickup order"}</Button><Link className="mt-4 block text-center text-sm font-semibold text-[#784721] underline" href="/cart">Back to cart</Link></section><aside className="h-fit rounded-3xl bg-[#3b2116] p-6 text-[#fff9ee]"><h2 className="text-lg font-bold">ETB total</h2><div className="mt-5 space-y-3 border-b border-white/15 pb-4 text-sm text-[#f7dfbc]"><p className="flex justify-between"><span>Subtotal</span><span>ETB {subtotal.toFixed(2)}</span></p><p className="flex justify-between"><span>VAT (15%)</span><span>ETB {vat.toFixed(2)}</span></p></div><p className="mt-4 flex justify-between text-lg font-bold"><span>Total</span><span>ETB {total.toFixed(2)}</span></p><p className="mt-5 text-sm text-[#e9ca9e]">Payment is collected when you pick up your order.</p></aside></div></div></main>;
}
