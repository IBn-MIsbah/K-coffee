"use client";

import { Button } from "@/components/ui/button";
import { getCartItemCount, useCart } from "@/lib/store/useCart";
import { Coffee, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CustomerDashboardActions() {
  const itemCount = useCart((state) => getCartItemCount(state.items));

  return <div className="flex flex-wrap gap-3">
    <Button asChild className="min-h-12 rounded-full bg-[#b56527] px-5 font-bold text-white hover:bg-[#934817] focus-visible:ring-[#934817]"><Link href="/menu"><Coffee aria-hidden="true" className="size-4" />Start an order</Link></Button>
    <Button asChild variant="outline" className="min-h-12 rounded-full border-[#c9853c] bg-white px-5 font-bold text-[#6d3514] hover:bg-[#f7ebd8] hover:text-[#3b2116] focus-visible:ring-[#934817]"><Link href="/cart"><ShoppingCart aria-hidden="true" className="size-4" />Cart{itemCount ? ` (${itemCount})` : ""}</Link></Button>
  </div>;
}
