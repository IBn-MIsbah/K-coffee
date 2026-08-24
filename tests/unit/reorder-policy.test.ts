import { describe, expect, it } from "vitest";
import { buildCustomerReorderPreview } from "@/lib/orders/reorder-policy";

describe("customer reorder preview", () => {
  it("uses current prices and excludes inactive products", () => {
    const preview = buildCustomerReorderPreview([
      { quantity: 2, product: { id: "available", name: "Latte", price: { toString: () => "95.50" }, imageUrl: null, isActive: true, category: { isActive: true } } },
      { quantity: 1, product: { id: "retired", name: "Old tea", price: { toString: () => "50" }, imageUrl: null, isActive: false, category: { isActive: true } } },
    ]);

    expect(preview.available).toEqual([{ productId: "available", name: "Latte", price: "95.50", imageUrl: null, quantity: 2 }]);
    expect(preview.unavailable).toEqual([expect.objectContaining({ productId: "retired", reason: "This item is no longer available." })]);
  });

  it("excludes products from archived categories", () => {
    const preview = buildCustomerReorderPreview([
      { quantity: 1, product: { id: "archived-category", name: "Mocha", price: { toString: () => "80" }, imageUrl: null, isActive: true, category: { isActive: false } } },
    ]);

    expect(preview.available).toEqual([]);
    expect(preview.unavailable[0]).toMatchObject({ productId: "archived-category", reason: "This item’s category is no longer available." });
  });
});
