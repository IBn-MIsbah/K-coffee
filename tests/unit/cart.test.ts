import { describe, expect, it } from "vitest";
import { getCartItemCount, getCartSubtotal, type CartItem } from "@/lib/store/useCart";

const items: CartItem[] = [
  { productId: "espresso", name: "Espresso", price: 90, quantity: 2 },
  { productId: "tea", name: "Tea", price: 45.5, quantity: 3 },
];

describe("cart totals", () => {
  it("counts item quantities rather than line items", () => {
    expect(getCartItemCount(items)).toBe(5);
  });
  it("calculates a checkout subtotal from price snapshots", () => {
    expect(getCartSubtotal(items)).toBe(316.5);
  });
  it("returns zero for an empty cart", () => {
    expect(getCartItemCount([])).toBe(0);
    expect(getCartSubtotal([])).toBe(0);
  });
});
