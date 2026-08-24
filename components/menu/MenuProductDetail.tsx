"use client";

import { AddToCartButton } from "@/components/menu/AddToCartButton";
import MenuItems from "@/components/menu/MenuItems";
import { ProductVisual } from "@/components/menu/ProductVisual";
import { Button } from "@/components/ui/button";
import type { MenuProduct } from "@/lib/menu/catalogue-types";
import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type MenuProductDetailProps = {
  product: MenuProduct;
  relatedProducts: MenuProduct[];
  backHref: string;
};

export function MenuProductDetail({
  product,
  relatedProducts,
  backHref,
}: MenuProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const total = product.price * quantity;

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#f7f1e6] pb-16 pt-28 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-40 size-96 rounded-full bg-[#f4bd4d]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 top-20 size-[30rem] rounded-full bg-[#9b5b30]/12 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={backHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 font-bold text-[#7d4018] transition-colors hover:bg-[#f7ebd8] hover:text-[#3b2116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#934817]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to menu
          </Link>
          <span aria-hidden="true" className="text-[#b28b6c]">/</span>
          <span className="font-semibold text-[#725b4c]">{product.category.name}</span>
        </nav>

        <section className="grid overflow-hidden rounded-[2rem] border border-[#ead9bf] bg-[#fffaf0] shadow-[0_18px_45px_rgba(88,49,22,.1)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.9fr)]">
          <div className="relative min-h-72 p-4 sm:p-6">
            <ProductVisual
              imageUrl={product.imageUrl}
              alt={product.name}
              index={0}
              className="aspect-square w-full rounded-[1.5rem] shadow-[0_14px_35px_rgba(76,37,15,.2)]"
            />
            <span className="absolute left-8 top-8 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm sm:left-10 sm:top-10">
              {product.category.name}
            </span>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a56328]">Menu item</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-.04em] text-[#2c1911] sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-extrabold tabular-nums text-[#9b5828]">
              ETB {product.price.toFixed(2)}
            </p>
            <p className="mt-5 text-base leading-7 text-[#725b4c]">
              {product.description || "Made to order for your next pickup."}
            </p>

            <dl className="mt-7 grid gap-3 sm:grid-cols-2">
              <DetailFact icon={MapPin} label="Pickup" value="Choose a location at checkout" />
              <DetailFact icon={CalendarClock} label="Timing" value="20-minute pickup slots" />
              <DetailFact icon={ReceiptText} label="Payment" value="Pay when you collect" />
              <DetailFact icon={ShoppingBag} label="VAT" value="15% calculated at checkout" />
            </dl>

            <div className="mt-8 border-t border-[#ead9bf] pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#3b2116]">Quantity</p>
                  <div className="mt-2 inline-flex items-center rounded-xl border border-[#dfc6a9] bg-white p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      disabled={quantity <= 1}
                      aria-label={`Decrease ${product.name} quantity`}
                      className="size-10 rounded-lg text-[#7d4018] hover:bg-[#f7ebd8] hover:text-[#3b2116]"
                    >
                      <Minus aria-hidden="true" className="size-4" />
                    </Button>
                    <span className="w-10 text-center text-lg font-extrabold tabular-nums text-[#3b2116]">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                      disabled={quantity >= 99}
                      aria-label={`Increase ${product.name} quantity`}
                      className="size-10 rounded-lg text-[#7d4018] hover:bg-[#f7ebd8] hover:text-[#3b2116]"
                    >
                      <Plus aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#725b4c]">Order total</p>
                  <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#3b2116]">
                    ETB {total.toFixed(2)}
                  </p>
                </div>
              </div>
              <AddToCartButton
                productId={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                quantity={quantity}
                label={quantity === 1 ? "Add to cart" : `Add ${quantity} to cart`}
                className="mt-6 min-h-12 rounded-xl bg-[#b56527] text-base font-bold text-white hover:bg-[#934817]"
              />
            </div>
          </div>
        </section>

        {relatedProducts.length ? (
          <section aria-labelledby="related-menu-heading" className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">Keep browsing</p>
                <h2 id="related-menu-heading" className="mt-2 text-2xl font-extrabold tracking-[-.03em] text-[#2c1911]">
                  More from {product.category.name}
                </h2>
              </div>
              <Button
                asChild
                variant="ghost"
                className="min-h-11 rounded-xl text-[#7d4018] hover:bg-[#f7ebd8] hover:text-[#3b2116]"
              >
                <Link href={backHref}>View full menu</Link>
              </Button>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct, index) => (
                <MenuItems
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  category={relatedProduct.category.name}
                  description={relatedProduct.description}
                  imageUrl={relatedProduct.imageUrl}
                  price={relatedProduct.price}
                  href={`/menu/${relatedProduct.id}?category=${encodeURIComponent(product.category.slug)}`}
                  visualIndex={index + 1}
                  showFavorite={false}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function DetailFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 rounded-2xl bg-white p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f5dfba] text-[#7d4018]">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-bold uppercase tracking-[.12em] text-[#a56328]">{label}</dt>
        <dd className="mt-1 text-sm font-semibold leading-5 text-[#3b2116]">{value}</dd>
      </div>
    </div>
  );
}
