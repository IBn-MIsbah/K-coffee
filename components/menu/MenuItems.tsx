"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useCart } from "@/lib/store/useCart";
import { Coffee, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MenuItemsProps {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string | null;
  price: number;
}

const MenuItems = ({ id, name, description, price, imageUrl }: MenuItemsProps) => {
  const addItem = useCart((state) => state.addItem);
  const router = useRouter();

  const addToCart = () => {
    addItem({ productId: id, name, price, imageUrl });
    toast.success(`${name} added to your cart`, {
      description: `$${price.toFixed(2)}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
  };

  return (
    <Card className="group flex h-full flex-col border-0 bg-amber-100 p-5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:bg-amber-50 hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none">
      <Link href={`/menu/${id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-amber-200/50">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" src={imageUrl} alt={name} />
          ) : (
            <div className="grid size-full place-items-center text-amber-700/60"><Coffee aria-hidden="true" className="size-12" /></div>
          )}
        </div>
        <div className="grow space-y-3">
          <CardTitle className="line-clamp-1 text-2xl font-bold text-amber-950">{name}</CardTitle>
          {description && <CardDescription className="min-h-10 line-clamp-2 text-gray-600">{description}</CardDescription>}
          <p className="pt-2 text-2xl font-bold text-amber-900">${price.toFixed(2)}</p>
        </div>
      </Link>
      <Button onClick={addToCart} className="mt-4 min-h-12 w-full bg-amber-600 py-3 text-base font-semibold text-amber-50 hover:bg-amber-700" size="lg">
        <Plus aria-hidden="true" className="size-5" /> Add to cart
      </Button>
    </Card>
  );
};

export default MenuItems;
