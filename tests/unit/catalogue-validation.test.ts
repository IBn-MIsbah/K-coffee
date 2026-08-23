import { describe, expect, it } from "vitest";
import { CatalogueValidationError, parseCategoryInput, parseProductInput } from "@/lib/admin/catalogue-validation";

describe("catalogue validation", () => {
  it("normalizes an admin category and product payload", () => {
    expect(parseCategoryInput({ name: " Espresso ", slug: "Espresso-Drinks" })).toEqual({ name: "Espresso", slug: "espresso-drinks" });
    const product = parseProductInput({ name: "Latte", description: "Smooth", price: "85.50", categoryId: "category_1", imageUrl: "https://assets.example.com/latte.jpg", isActive: true });
    expect(product.name).toBe("Latte");
    expect(product.price.toString()).toBe("85.5");
  });

  it("rejects unsafe slugs, invalid prices, and incomplete product payloads", () => {
    expect(() => parseCategoryInput({ name: "Coffee", slug: "coffee drinks" })).toThrow(CatalogueValidationError);
    expect(() => parseProductInput({ name: "Latte", description: null, price: "-1", categoryId: "category_1", imageUrl: null, isActive: true })).toThrow(CatalogueValidationError);
    expect(() => parseProductInput({ name: "Latte", price: "50", categoryId: "category_1", imageUrl: null })).toThrow(CatalogueValidationError);
  });
});
