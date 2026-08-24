"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useCart } from "@/lib/store/useCart";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity?: number;
  className?: string;
  label?: string;
};

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  quantity = 1,
  className,
  label = "Add to cart",
}: AddToCartButtonProps) {
  const addItem = useCart((state) => state.addItem);
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

    setIsAdding(true);
    try {
      const authorization = await fetch("/api/cart/authorize", { method: "POST" });
      if (!authorization.ok) {
        toast.error("Your cart session could not be verified. Please sign in again.");
        router.push("/login?callbackUrl=%2Fcart");
        return;
      }

      addItem({ productId, name, price, imageUrl }, quantity);
      toast.success(
        quantity === 1 ? `${name} added to your cart` : `${quantity} ${name} added to your cart`,
        {
        description: `ETB ${(price * quantity).toFixed(2)}`,
        action: { label: "View cart", onClick: () => router.push("/cart") },
        },
      );
    } catch {
      toast.error("We could not add this item right now.", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={addToCart}
      disabled={!isHydrated || isPending || isAdding}
      className={cn(
        "min-h-12 w-full bg-amber-600 py-3 text-base font-semibold text-amber-50 hover:bg-amber-700",
        className,
      )}
    >
      <Plus aria-hidden="true" className="size-5" />
      {isAdding ? "Adding…" : label}
    </Button>
  );
}
