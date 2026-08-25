"use client";

import { ProductVisual } from "@/components/menu/ProductVisual";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCartItemCount, getCartSubtotal, useCart } from "@/lib/store/useCart";
import {
  ArrowRight,
  Coffee,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const VAT_RATE = 0.15;

const formatMoney = (amount: number) => `ETB ${amount.toFixed(2)}`;

function CartLoadingState() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading your cart"
      className="rounded-[2rem] border border-white/15 bg-white/[0.09] p-5 shadow-[0_24px_80px_rgba(17,7,3,.28)] backdrop-blur-xl sm:p-7"
    >
      <div className="h-5 w-32 animate-pulse rounded-full bg-white/15 motion-reduce:animate-none" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4"
          >
            <div className="size-20 animate-pulse rounded-2xl bg-white/15 motion-reduce:animate-none" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-4 w-2/5 animate-pulse rounded-full bg-white/15 motion-reduce:animate-none" />
              <div className="h-3 w-1/4 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CartPage() {
  const items = useCart((state) => state.items);
  const incrementItem = useCart((state) => state.incrementItem);
  const decrementItem = useCart((state) => state.decrementItem);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clearCart);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  useEffect(() => {
    const markHydrated = () => setHasHydrated(true);
    const unsubscribe = useCart.persist.onFinishHydration(markHydrated);
    if (useCart.persist.hasHydrated()) markHydrated();

    // Browser privacy settings can deny local storage. Do not leave the cart
    // in an infinite loading state when persisted data cannot be read.
    const fallbackTimer = window.setTimeout(markHydrated, 250);
    return () => {
      unsubscribe();
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  const itemCount = getCartItemCount(items);
  const subtotal = getCartSubtotal(items);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;
  const itemCountLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex min-h-dvh min-w-0 flex-1 overflow-hidden bg-[#21110b] px-4 pb-12 pt-28 text-[#fff8ec] sm:px-6 sm:pt-32 lg:px-8"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(206,137,65,.30),transparent_26%),radial-gradient(circle_at_92%_12%,rgba(248,201,126,.16),transparent_24%),linear-gradient(145deg,#24120b_0%,#3a1f13_48%,#1b0d08_100%)]" />
        <div className="absolute -left-32 bottom-[-11rem] size-[32rem] rounded-full border border-[#f7c879]/15 bg-[#b8652c]/15 blur-3xl" />
        <div className="absolute -right-24 top-36 size-[25rem] rounded-full border border-white/10 bg-[#f6ca88]/10 blur-3xl" />
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,246,229,.20)_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <header className="rounded-[2rem] border border-white/15 bg-white/[0.09] p-6 shadow-[0_24px_80px_rgba(17,7,3,.28)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#f5c778]/35 bg-[#f4bd4d]/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-[#ffd994]">
                <ShoppingBag aria-hidden="true" className="size-3.5" />
                Your pickup order
              </p>
              <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-[-.045em] text-[#fffaf0] sm:text-4xl lg:text-5xl">
                Your cart, on your schedule.
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base leading-7 text-[#f3dec2]/85">
                Review your items now. You&apos;ll choose a location and a 20-minute pickup slot at checkout.
              </p>
            </div>

            {hasHydrated && items.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsClearDialogOpen(true)}
                className="min-h-11 self-start rounded-xl border border-red-200/20 bg-red-950/15 px-4 font-bold text-red-100 hover:bg-red-950/35 hover:text-white focus-visible:ring-red-200/70 sm:self-auto"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Clear cart
              </Button>
            ) : null}
          </div>

          <div className="mt-7 grid gap-3 border-t border-white/12 pt-6 text-sm sm:grid-cols-3">
            <p className="flex items-center gap-3 text-[#fff0d7]">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.08] font-bold tabular-nums text-[#f8c56e]">
                {hasHydrated ? itemCount : "—"}
              </span>
              {hasHydrated ? `${itemCountLabel} in your cart` : "Preparing your cart"}
            </p>
            <p className="flex items-center gap-3 text-[#fff0d7]">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.08] text-[#f8c56e]">
                <Coffee aria-hidden="true" className="size-4" />
              </span>
              Made to order for pickup
            </p>
            <p className="flex items-center gap-3 text-[#fff0d7]">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.08] text-[#f8c56e]">
                <ShieldCheck aria-hidden="true" className="size-4" />
              </span>
              Pay at the counter
            </p>
          </div>
        </header>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {hasHydrated ? `${itemCountLabel} in your cart. Estimated total ${formatMoney(total)}.` : "Loading your cart."}
        </p>

        <div className="mt-6 sm:mt-8">
          {!hasHydrated ? (
            <CartLoadingState />
          ) : items.length === 0 ? (
            <section className="grid min-h-96 place-items-center rounded-[2rem] border border-white/15 bg-white/[0.09] p-8 text-center shadow-[0_24px_80px_rgba(17,7,3,.28)] backdrop-blur-xl sm:p-12">
              <div className="max-w-lg">
                <span className="mx-auto grid size-16 place-items-center rounded-[1.35rem] border border-[#f7cf88]/35 bg-[#f4bd4d]/15 text-[#ffd98f] shadow-[0_12px_32px_rgba(12,5,2,.22)]">
                  <Coffee aria-hidden="true" className="size-7" />
                </span>
                <h2 className="mt-6 text-2xl font-extrabold tracking-[-.03em] text-[#fffaf0] sm:text-3xl">
                  Your cart is waiting for its first cup.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#f3dec2]/85">
                  Browse the menu, add what sounds good, then choose the pickup time that fits your day.
                </p>
                <Button
                  asChild
                  className="mt-7 min-h-12 rounded-full bg-[#f4bd4d] px-6 font-bold text-[#32170a] shadow-[0_12px_26px_rgba(10,4,1,.22)] transition hover:bg-[#ffd16c]"
                >
                  <Link href="/menu">
                    Browse the menu
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </div>
            </section>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-8">
              <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.09] shadow-[0_24px_80px_rgba(17,7,3,.28)] backdrop-blur-xl">
                <div className="flex flex-col gap-2 border-b border-white/12 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#fffaf0]">Cart items</h2>
                    <p className="mt-1 text-sm text-[#f3dec2]/80">Adjust quantities before checkout.</p>
                  </div>
                  <p className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-sm font-bold tabular-nums text-[#fff0d7]">
                    {itemCountLabel}
                  </p>
                </div>

                <ul className="divide-y divide-white/12">
                  {items.map((item, index) => (
                    <li key={item.productId} className="p-5 sm:p-6">
                      <div className="flex gap-4 sm:gap-5">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-[0_10px_26px_rgba(10,4,1,.22)] sm:size-24">
                          <ProductVisual
                            imageUrl={item.imageUrl ?? null}
                            alt={item.name}
                            index={index}
                            className="size-full"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                            <div className="min-w-0">
                              <h3 className="break-words text-base font-extrabold text-[#fffaf0] sm:text-lg">
                                {item.name}
                              </h3>
                              <p className="mt-1 text-sm text-[#f3dec2]/80">{formatMoney(item.price)} each</p>
                            </div>
                            <p className="shrink-0 text-base font-extrabold tabular-nums text-[#ffd98f]">
                              {formatMoney(item.price * item.quantity)}
                            </p>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <div
                              role="group"
                              className="inline-flex min-h-11 items-center rounded-xl border border-white/18 bg-black/10 p-0.5 shadow-inner"
                              aria-label={`${item.name} quantity`}
                            >
                              <button
                                type="button"
                                onClick={() => decrementItem(item.productId)}
                                className="grid size-10 place-items-center rounded-lg text-[#fff0d7] transition-colors hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd16c]"
                                aria-label={item.quantity === 1 ? `Remove ${item.name} from cart` : `Decrease ${item.name} quantity`}
                              >
                                {item.quantity === 1 ? <Trash2 aria-hidden="true" className="size-4" /> : <Minus aria-hidden="true" className="size-4" />}
                              </button>
                              <span className="w-10 text-center text-sm font-extrabold tabular-nums text-[#fffaf0]" aria-live="off">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => incrementItem(item.productId)}
                                disabled={item.quantity >= 99}
                                className="grid size-10 place-items-center rounded-lg text-[#fff0d7] transition-colors hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd16c] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={`Increase ${item.name} quantity`}
                              >
                                <Plus aria-hidden="true" className="size-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-red-100 transition-colors hover:bg-red-950/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <aside className="rounded-[2rem] border border-[#f5c778]/25 bg-[#fffaf0]/[0.13] p-6 shadow-[0_24px_80px_rgba(17,7,3,.32)] backdrop-blur-xl sm:p-7 xl:sticky xl:top-28">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-[#ffd994]">Order summary</p>
                    <h2 className="mt-2 text-xl font-extrabold tracking-[-.025em] text-[#fffaf0]">Ready for checkout</h2>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/[0.08] text-[#ffd98f]">
                    <ShoppingBag aria-hidden="true" className="size-5" />
                  </span>
                </div>

                <dl className="mt-6 space-y-3 border-y border-white/14 py-5 text-sm text-[#f7e2c5]">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Subtotal</dt>
                    <dd className="font-semibold tabular-nums text-[#fffaf0]">{formatMoney(subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>VAT (15%)</dt>
                    <dd className="font-semibold tabular-nums text-[#fffaf0]">{formatMoney(vat)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-2 text-base">
                    <dt className="font-extrabold text-[#fffaf0]">Estimated total</dt>
                    <dd className="text-lg font-extrabold tabular-nums text-[#ffd98f]">{formatMoney(total)}</dd>
                  </div>
                </dl>

                <p className="mt-5 flex gap-3 text-sm leading-6 text-[#f3dec2]/85">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#ffd98f]" />
                  Payment is collected at pickup. Your location and 20-minute pickup slot are selected next.
                </p>

                <Button
                  asChild
                  className="mt-6 min-h-12 w-full rounded-xl bg-[#f4bd4d] font-bold text-[#32170a] shadow-[0_12px_26px_rgba(10,4,1,.22)] transition hover:bg-[#ffd16c]"
                >
                  <Link href="/checkout">
                    Continue to checkout
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="mt-2 min-h-11 w-full rounded-xl font-bold text-[#fff8ec] hover:bg-white/10 hover:text-white"
                >
                  <Link href="/menu">Add more items</Link>
                </Button>
              </aside>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear your cart?</DialogTitle>
            <DialogDescription>
              This removes all {itemCountLabel} from this device. You can add them again from the menu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="min-h-11">
                Keep items
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => {
                clearCart();
                setIsClearDialogOpen(false);
              }}
              className="min-h-11 bg-red-700 text-white hover:bg-red-800"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Clear cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
