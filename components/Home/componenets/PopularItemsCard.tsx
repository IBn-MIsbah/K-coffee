import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductVisual } from "@/components/menu/ProductVisual";
import prisma from "@/lib/prisma";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const PopularItemsCard = async () => {
  const products = await prisma.product.findMany({
    take: 3,
    where: { isActive: true, category: { isActive: true } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      category: { select: { name: true } },
    },
  });

  if (!products.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#d9b98f] bg-[#fffaf0]/80 px-6 py-12 text-center sm:px-10">
        <p className="text-lg font-bold text-[#3b2116]">New drinks are on their way.</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7b604e]">
          Explore the full menu for everything currently available for pickup.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#3b2116] px-5 text-sm font-bold text-[#fff9ee] transition-colors hover:bg-[#5a3020] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b5828]"
        >
          View full menu <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    );
  }

  const cardGridClassName =
    products.length === 1
      ? "max-w-sm"
      : products.length === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={`grid gap-5 ${cardGridClassName}`}>
      {products.map((product, index) => (
        <article
          key={product.id}
          className="group flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-[#e5cfad] bg-[#fffdf8] shadow-[0_14px_35px_rgba(76,37,15,.08)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(76,37,15,.15)] motion-reduce:transform-none motion-reduce:transition-none"
        >
          <Link
            href={`/menu/${product.id}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9b5828]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <ProductVisual
                imageUrl={product.imageUrl}
                index={index}
                className="absolute inset-0"
              />
              <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                {product.category.name}
              </span>
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 text-sm font-bold text-white">
                View details <ArrowUpRight aria-hidden="true" className="size-4" />
              </span>
            </div>
            <div className="min-w-0 p-5 pb-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 text-lg font-extrabold tracking-[-.02em] text-[#2f1a12] transition-colors group-hover:text-[#9b5828]">
                  {product.name}
                </h3>
                <p className="shrink-0 text-sm font-extrabold text-[#9b5828]">
                  ETB {Number(product.price).toFixed(2)}
                </p>
              </div>
              <p className="mt-2 min-h-10 text-sm leading-5 text-[#786050]">
                {product.description || "Made to order for your next pickup."}
              </p>
            </div>
          </Link>
          <div className="mt-auto px-5 pb-5">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={Number(product.price)}
              imageUrl={product.imageUrl}
              className="min-h-11 rounded-xl bg-[#3b2116] text-sm hover:bg-[#5a3020]"
            />
          </div>
        </article>
      ))}
    </div>
  );
};

export default PopularItemsCard;
