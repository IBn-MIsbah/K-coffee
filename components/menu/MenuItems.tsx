"use client";

import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductVisual } from "@/components/menu/ProductVisual";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { ArrowUpRight, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface MenuItemsProps {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  imageUrl: string | null;
  price: number;
  href?: string;
  visualIndex?: number;
  isFavorite?: boolean;
  showFavorite?: boolean;
  onFavoriteChange?: (productId: string, isFavorite: boolean) => void;
}

const MenuItems = ({
  id,
  name,
  category,
  description,
  price,
  imageUrl,
  href = `/menu/${id}`,
  visualIndex = 0,
  isFavorite = false,
  showFavorite = true,
  onFavoriteChange,
}: MenuItemsProps) => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [savingFavorite, setSavingFavorite] = useState(false);

  const toggleFavorite = async () => {
    const role = session?.user?.role;
    if (!session?.user) {
      router.push("/login?callbackUrl=%2Fmenu");
      return;
    }
    if (role === "CASHIER") {
      router.push("/pos");
      return;
    }
    if (role === "ADMIN" || role === "SUPERADMIN") {
      router.push("/dashboard/admin");
      return;
    }
    if (role !== "USER") {
      toast.error("Your account cannot save customer favourites.");
      return;
    }

    setSavingFavorite(true);
    try {
      const response = await fetch(
        isFavorite ? `/api/account/favorites/${id}` : "/api/account/favorites",
        {
          method: isFavorite ? "DELETE" : "POST",
          headers: isFavorite ? undefined : { "Content-Type": "application/json" },
          body: isFavorite ? undefined : JSON.stringify({ productId: id }),
        },
      );
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update saved items.");
      }

      onFavoriteChange?.(id, !isFavorite);
      toast.success(isFavorite ? "Removed from saved items" : "Saved for later", {
        description: name,
      });
    } catch (error) {
      toast.error("Saved items were not updated", {
        description: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-[#e5cfad] bg-[#fffdf8] shadow-[0_14px_35px_rgba(76,37,15,.08)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(76,37,15,.15)] motion-reduce:transform-none motion-reduce:transition-none">
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9b5828]"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <ProductVisual
            imageUrl={imageUrl}
            index={visualIndex}
            className="absolute inset-0"
          />
          <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            {category}
          </span>
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 text-sm font-bold text-white">
            View details <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        </div>
        <div className="min-w-0 p-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 text-lg font-extrabold tracking-[-.02em] text-[#2f1a12] transition-colors group-hover:text-[#9b5828]">
              {name}
            </h2>
            <p className="shrink-0 text-sm font-extrabold tabular-nums text-[#9b5828]">
              ETB {price.toFixed(2)}
            </p>
          </div>
          <p className="mt-2 min-h-10 text-sm leading-5 text-[#786050]">
            {description || "Made to order for your next pickup."}
          </p>
        </div>
      </Link>

      <div className="mt-auto flex gap-2 px-5 pb-5">
        <AddToCartButton
          productId={id}
          name={name}
          price={price}
          imageUrl={imageUrl}
          className="min-h-11 flex-1 rounded-xl bg-[#3b2116] px-3 text-sm hover:bg-[#5a3020]"
        />
        {showFavorite ? (
          <Button
            type="button"
            variant="outline"
            onClick={toggleFavorite}
            disabled={isPending || savingFavorite}
            aria-label={isFavorite ? `Remove ${name} from saved items` : `Save ${name} for later`}
            aria-pressed={isFavorite}
            className="size-11 shrink-0 rounded-xl border-[#d9b98f] bg-white p-0 text-[#7d4018] hover:bg-[#fff4df] hover:text-[#7d4018]"
          >
            <Heart
              aria-hidden="true"
              className={`size-4 ${isFavorite ? "fill-current" : ""}`}
            />
          </Button>
        ) : null}
      </div>
    </article>
  );
};

export default MenuItems;
