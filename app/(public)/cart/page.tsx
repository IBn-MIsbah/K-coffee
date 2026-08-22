"use client";

import { Button } from "@/components/ui/button";
import { getCartItemCount, getCartSubtotal, useCart } from "@/lib/store/useCart";
import { Coffee, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

const formatMoney = (amount: number) => `ETB ${amount.toFixed(2)}`;

export default function CartPage() {
  const items = useCart((state) => state.items);
  const incrementItem = useCart((state) => state.incrementItem);
  const decrementItem = useCart((state) => state.decrementItem);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clearCart);
  const itemCount = getCartItemCount(items);
  const subtotal = getCartSubtotal(items);

  return (
    <main className="min-h-dvh bg-[#f7f1e6] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">Your order</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-.035em] text-[#2c1911] sm:text-4xl">Your cart</h1>
            <p className="mt-2 text-[#725b4c]">{itemCount === 0 ? "Your cart is ready when you are." : `${itemCount} ${itemCount === 1 ? "item" : "items"} selected.`}</p>
          </div>
          {items.length > 0 && <Button variant="ghost" onClick={clearCart} className="min-h-11 text-[#9b3b2d] hover:bg-red-50 hover:text-[#7e271d]"><Trash2 aria-hidden="true" className="size-4" /> Clear cart</Button>}
        </header>

        {items.length === 0 ? (
          <section className="grid min-h-80 place-items-center rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-8 text-center shadow-[0_18px_45px_rgba(88,49,22,.08)]">
            <div><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f5dfba] text-[#9b5828]"><Coffee aria-hidden="true" className="size-7" /></span><h2 className="mt-5 text-2xl font-bold text-[#3b2116]">Your cart is empty</h2><p className="mx-auto mt-2 max-w-md text-[#725b4c]">Choose something you&apos;ll enjoy, then select a pickup time at checkout.</p><Button asChild className="mt-6 min-h-12 rounded-full bg-[#b56527] px-6 font-bold text-white hover:bg-[#934817]"><Link href="/menu"><ShoppingBag aria-hidden="true" className="size-4" /> Browse the menu</Link></Button></div>
          </section>
        ) : (
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="overflow-hidden rounded-3xl border border-[#ead9bf] bg-[#fffaf0] shadow-[0_18px_45px_rgba(88,49,22,.08)]">
              <ul className="divide-y divide-[#ead9bf]">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
                    <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#f5dfba] text-[#9b5828] sm:size-24">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="size-full object-cover" />
                      ) : <Coffee aria-hidden="true" className="size-7" />}
                    </div>
                    <div className="min-w-0 flex-1"><h2 className="truncate font-bold text-[#3b2116]">{item.name}</h2><p className="mt-1 text-sm text-[#725b4c]">{formatMoney(item.price)} each</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center rounded-full border border-[#dfc6a9] bg-white"><button type="button" onClick={() => decrementItem(item.productId)} className="grid size-11 place-items-center rounded-full text-[#784721] hover:bg-[#f6e8d3]" aria-label={`Decrease ${item.name} quantity`}><Minus aria-hidden="true" className="size-4" /></button><span className="w-9 text-center text-sm font-bold tabular-nums text-[#3b2116]" aria-label={`${item.quantity} ${item.name}`}>{item.quantity}</span><button type="button" onClick={() => incrementItem(item.productId)} disabled={item.quantity >= 99} className="grid size-11 place-items-center rounded-full text-[#784721] hover:bg-[#f6e8d3] disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Increase ${item.name} quantity`}><Plus aria-hidden="true" className="size-4" /></button></div><div className="flex items-center gap-3"><p className="font-bold tabular-nums text-[#3b2116]">{formatMoney(item.price * item.quantity)}</p><button type="button" onClick={() => removeItem(item.productId)} className="grid size-11 place-items-center rounded-full text-[#9b3b2d] hover:bg-red-50" aria-label={`Remove ${item.name} from cart`}><Trash2 aria-hidden="true" className="size-4" /></button></div></div></div>
                  </li>
                ))}
              </ul>
            </section>
            <aside className="h-fit rounded-3xl bg-[#3b2116] p-6 text-[#fff9ee] shadow-[0_18px_45px_rgba(60,32,17,.2)]"><h2 className="text-lg font-bold">Order summary</h2><div className="mt-5 flex items-center justify-between border-b border-white/15 pb-4 text-[#f7dfbc]"><span>Subtotal</span><span className="font-semibold tabular-nums">{formatMoney(subtotal)}</span></div><p className="mt-4 text-sm leading-5 text-[#e9ca9e]">A 15% VAT and your 20-minute pickup slot are confirmed at checkout. Payment is at pickup.</p><Button asChild className="mt-6 min-h-12 w-full rounded-full bg-[#f4bd4d] font-bold text-[#30170b] hover:bg-[#ffd36f]"><Link href="/checkout">Continue to checkout</Link></Button><Button asChild variant="ghost" className="mt-2 min-h-11 w-full text-[#fff9ee] hover:bg-white/10 hover:text-white"><Link href="/menu">Add more items</Link></Button></aside>
          </div>
        )}
      </div>
    </main>
  );
}
