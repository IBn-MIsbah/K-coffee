"use client";

import MenuItems from "@/components/menu/MenuItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import {
  type MenuFilters,
  type MenuSort,
  type PublicMenuCatalogue,
  menuHref,
} from "@/lib/menu/catalogue-types";
import {
  ArrowLeft,
  ArrowRight,
  Coffee,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

const sortLabels: Record<MenuSort, string> = {
  latest: "Newest additions",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

type MenuCatalogueProps = PublicMenuCatalogue;

export function MenuCatalogue({
  categories,
  products,
  total,
  pageSize,
  filters,
}: MenuCatalogueProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isNavigating, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allProductCount = categories.reduce(
    (count, category) => count + category.productCount,
    0,
  );
  const hasActiveFilters = Boolean(filters.category || filters.q || filters.sort !== "latest");
  const productGridClassName =
    products.length === 1
      ? "max-w-md"
      : products.length === 2
        ? "sm:grid-cols-2 xl:max-w-4xl"
        : "sm:grid-cols-2 xl:grid-cols-3";

  useEffect(() => {
    if (session?.user?.role !== "USER") return;

    let isCurrent = true;
    void fetch("/api/account/favorites")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load saved items.");
        return response.json() as Promise<{ productIds: string[] }>;
      })
      .then((data) => {
        if (isCurrent) setFavoriteIds(data.productIds);
      })
      .catch(() => {
        // Saving remains available; the card action will surface a precise error if needed.
      });

    return () => {
      isCurrent = false;
    };
  }, [session?.user?.role]);

  const navigate = (next: Partial<MenuFilters>) => {
    startTransition(() => {
      router.push(
        menuHref({
          ...filters,
          ...next,
        }),
      );
    });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();
    navigate({ q: q || undefined, page: 1 });
  };

  const handleFavoriteChange = (productId: string, favorite: boolean) => {
    setFavoriteIds((current) =>
      favorite
        ? [...new Set([...current, productId])]
        : current.filter((id) => id !== productId),
    );
  };

  const detailHref = (productId: string) => {
    const currentMenuHref = menuHref(filters);
    return `/menu/${productId}${currentMenuHref.slice("/menu".length)}`;
  };

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#f7f1e6] pb-16 pt-28 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-44 size-96 rounded-full bg-[#f4bd4d]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-16 size-[32rem] rounded-full bg-[#9b5b30]/12 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="grid gap-6 rounded-[2rem] border border-[#ead9bf] bg-[#fffaf0]/85 p-6 shadow-[0_18px_45px_rgba(88,49,22,.08)] backdrop-blur-sm sm:p-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">
              Made for pickup
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-.045em] text-[#2c1911] sm:text-5xl">
              Find your next pause.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#725b4c] sm:text-lg">
              Browse the active K-Coffee menu, save what you love, and build an order when
              you&apos;re ready.
            </p>
          </div>
          <div className="rounded-2xl bg-[#3b2116] p-5 text-[#fff9ee] shadow-[0_14px_30px_rgba(60,32,17,.18)]">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4bd4d] text-[#3b2116]">
                <Coffee aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-bold">Pickup ordering</p>
                <p className="mt-0.5 text-sm text-[#e9ca9e]">Made to order, paid for on arrival.</p>
              </div>
            </div>
            <p className="mt-4 border-t border-white/15 pt-4 text-sm leading-6 text-[#f7dfbc]">
              Choose a location and a 20-minute pickup slot at checkout. VAT is calculated
              there.
            </p>
          </div>
        </header>

        <section
          aria-label="Menu filters"
          className="mt-7 rounded-[1.5rem] border border-[#ead9bf] bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <form onSubmit={handleSearch} className="min-w-0 w-full sm:max-w-md sm:flex-1">
              <label htmlFor="menu-search" className="mb-2 block text-sm font-bold text-[#3b2116]">
                Search the menu
              </label>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a654d]"
                  />
                  <Input
                    id="menu-search"
                    name="q"
                    type="search"
                    defaultValue={filters.q ?? ""}
                    placeholder="Coffee, tea, pastry…"
                    className="min-h-11 rounded-xl border-[#dfc6a9] bg-[#fffdf8] pl-10 text-[#2c1911] placeholder:text-[#9c806d] focus-visible:border-[#a56328] focus-visible:ring-[#a56328]/25"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isNavigating}
                  className="min-h-11 rounded-xl bg-[#3b2116] px-4 font-bold text-[#fff9ee] hover:bg-[#5a3020]"
                >
                  Search
                </Button>
              </div>
            </form>

            <div className="w-full sm:min-w-[12rem] sm:w-auto">
              <label htmlFor="menu-sort" className="mb-2 flex items-center gap-2 text-sm font-bold text-[#3b2116]">
                <SlidersHorizontal aria-hidden="true" className="size-4 text-[#a56328]" />
                Sort menu
              </label>
              <select
                id="menu-sort"
                value={filters.sort}
                onChange={(event) => navigate({ sort: event.target.value as MenuSort, page: 1 })}
                disabled={isNavigating}
                className="min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-[#fffdf8] px-3 text-sm font-semibold text-[#3b2116] outline-none transition focus-visible:border-[#a56328] focus-visible:ring-2 focus-visible:ring-[#a56328]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="mt-5 border-t border-[#ead9bf] pt-5">
            <legend className="text-sm font-bold text-[#3b2116]">Browse by category</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate({ category: undefined, page: 1 })}
                aria-pressed={!filters.category}
                className={`min-h-11 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#934817] ${
                  !filters.category
                    ? "bg-[#3b2116] text-[#fff9ee]"
                    : "bg-[#f7ebd8] text-[#6d3514] hover:bg-[#f1d9b9]"
                }`}
              >
                All menu <span className="ml-1 text-xs opacity-75">{allProductCount}</span>
              </button>
              {categories.map((category) => {
                const active = filters.category === category.slug;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => navigate({ category: active ? undefined : category.slug, page: 1 })}
                    aria-pressed={active}
                    className={`min-h-11 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#934817] ${
                      active
                        ? "bg-[#3b2116] text-[#fff9ee]"
                        : "bg-[#f7ebd8] text-[#6d3514] hover:bg-[#f1d9b9]"
                    }`}
                  >
                    {category.name} <span className="ml-1 text-xs opacity-75">{category.productCount}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>

        <section aria-labelledby="menu-results-heading" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">Today&apos;s menu</p>
              <h2 id="menu-results-heading" className="mt-1 text-2xl font-extrabold tracking-[-.03em] text-[#2c1911] sm:text-3xl">
                {filters.category
                  ? categories.find((category) => category.slug === filters.category)?.name ?? "Menu items"
                  : "All available items"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <p aria-live="polite" className="text-sm font-semibold text-[#725b4c]">
                {total} {total === 1 ? "item" : "items"} found
              </p>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate({ category: undefined, q: undefined, sort: "latest", page: 1 })}
                  className="min-h-11 rounded-xl text-[#7d4018] hover:bg-[#f7ebd8] hover:text-[#3b2116]"
                >
                  <X aria-hidden="true" className="size-4" />
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>

          {products.length ? (
            <div className={`mt-5 grid gap-5 ${productGridClassName}`}>
              {products.map((product, index) => (
                <MenuItems
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.category.name}
                  description={product.description}
                  imageUrl={product.imageUrl}
                  price={product.price}
                  href={detailHref(product.id)}
                  visualIndex={index}
                  isFavorite={favoriteIds.includes(product.id)}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid min-h-80 place-items-center rounded-[1.5rem] border border-dashed border-[#d9b98f] bg-[#fffaf0] p-8 text-center shadow-sm">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f5dfba] text-[#9b5828]">
                  <Coffee aria-hidden="true" className="size-7" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold text-[#3b2116]">Nothing matches yet</h3>
                <p className="mx-auto mt-2 max-w-md leading-7 text-[#725b4c]">
                  Try a different search or category, or clear the filters to view everything
                  currently available.
                </p>
                <Button
                  type="button"
                  onClick={() => navigate({ category: undefined, q: undefined, sort: "latest", page: 1 })}
                  className="mt-6 min-h-11 rounded-xl bg-[#b56527] px-5 font-bold text-white hover:bg-[#934817]"
                >
                  View all menu items
                </Button>
              </div>
            </div>
          )}

          {totalPages > 1 ? (
            <nav aria-label="Menu pagination" className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={filters.page <= 1 || isNavigating}
                onClick={() => navigate({ page: Math.max(1, filters.page - 1) })}
                className="min-h-11 rounded-xl border-[#d9b98f] bg-[#fffaf0] text-[#6d3514] hover:bg-[#f7ebd8] hover:text-[#3b2116]"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Previous
              </Button>
              <p className="min-w-28 text-center text-sm font-bold tabular-nums text-[#725b4c]">
                Page {filters.page} of {totalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={filters.page >= totalPages || isNavigating}
                onClick={() => navigate({ page: Math.min(totalPages, filters.page + 1) })}
                className="min-h-11 rounded-xl border-[#d9b98f] bg-[#fffaf0] text-[#6d3514] hover:bg-[#f7ebd8] hover:text-[#3b2116]"
              >
                Next
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
