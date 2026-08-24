"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useCart } from "@/lib/store/useCart";
import { useSession } from "@/lib/auth-client";
import { Coffee, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface MenuItemsProps {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string | null;
  price: number;
  isFavorite?: boolean;
  onFavoriteChange?: (productId: string, isFavorite: boolean) => void;
}

const MenuItems = ({
  id,
  name,
  description,
  price,
  imageUrl,
  isFavorite = false,
  onFavoriteChange,
}: MenuItemsProps) => {
  const addItem = useCart((state) => state.addItem);
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [savingFavorite, setSavingFavorite] = useState(false);

  const addToCart = async () => {
    const role = session?.user?.role;
    if (!session?.user) {
      router.push("/login?callbackUrl=%2Fcart");
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
      toast.error("Your account cannot use the customer cart.");
      return;
    }

    const authorization = await fetch("/api/cart/authorize", {
      method: "POST",
    });
    if (!authorization.ok) {
      toast.error(
        "Your cart session could not be verified. Please sign in again.",
      );
      router.push("/login?callbackUrl=%2Fcart");
      return;
    }

    addItem({ productId: id, name, price, imageUrl });
    toast.success(`${name} added to your cart`, {
      description: `ETB ${price.toFixed(2)}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
  };

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
      const response = await fetch(isFavorite ? `/api/account/favorites/${id}` : "/api/account/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: isFavorite ? undefined : { "Content-Type": "application/json" },
        body: isFavorite ? undefined : JSON.stringify({ productId: id }),
      });
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Unable to update saved items.");

      onFavoriteChange?.(id, !isFavorite);
      toast.success(isFavorite ? "Removed from favourites" : "Saved to favourites", { description: name });
    } catch (error) {
      toast.error("Saved items were not updated", { description: error instanceof Error ? error.message : "Try again shortly." });
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <Card className="group flex h-full flex-col border-0 bg-amber-100 p-5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:bg-amber-50 hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none">
      <Link
        href={`/menu/${id}`}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
      >
        <div className="relative mb-4 aspect-4/3 overflow-hidden rounded-lg bg-amber-200/50">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              src={imageUrl}
              alt={name}
            />
          ) : (
            <div className="grid size-full place-items-center text-amber-700/60">
              <Coffee aria-hidden="true" className="size-12" />
            </div>
          )}
        </div>
        <div className="grow space-y-3">
          <CardTitle className="line-clamp-1 text-2xl font-bold text-amber-950">
            {name}
          </CardTitle>
          {description && (
            <CardDescription className="min-h-10 line-clamp-2 text-gray-600">
              {description}
            </CardDescription>
          )}
          <p className="pt-2 text-2xl font-bold text-amber-900">
            ETB {price.toFixed(2)}
          </p>
        </div>
      </Link>
      <Button
        onClick={addToCart}
        disabled={isPending}
        className="mt-4 min-h-12 w-full bg-amber-600 py-3 text-base font-semibold text-amber-50 hover:bg-amber-700"
        size="lg"
      >
        <Plus aria-hidden="true" className="size-5" /> Add to cart
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={toggleFavorite}
        disabled={isPending || savingFavorite}
        aria-pressed={isFavorite}
        className="mt-2 min-h-11 w-full border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
      >
        <Heart aria-hidden="true" className={`size-4 ${isFavorite ? "fill-current" : ""}`} />
        {savingFavorite ? "Saving…" : isFavorite ? "Saved" : "Save for later"}
      </Button>
    </Card>
  );
};

export default MenuItems;
