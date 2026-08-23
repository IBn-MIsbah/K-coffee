import { describe, expect, it } from "vitest";
import { categoryFormSchema, productFormSchema, storeFormSchema, toFormErrors } from "@/lib/admin/form-schemas";

const hours = { mon: { open: "07:00", close: "19:00" }, tue: { open: "07:00", close: "19:00" }, wed: { open: "07:00", close: "19:00" }, thu: { open: "07:00", close: "19:00" }, fri: { open: "07:00", close: "19:00" }, sat: { open: "07:00", close: "19:00" }, sun: { open: null, close: null } };

describe("admin form schemas", () => {
  it("returns clear field errors for malformed catalogue input", () => {
    const result = productFormSchema.safeParse({ name: "", description: "", price: "4.999", categoryId: "", imageUrl: "http://image.example.com/coffee.jpg", isActive: true });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = toFormErrors(result.error);
      expect(errors.name).toBe("Enter a product name.");
      expect(errors.price).toContain("two decimal places");
      expect(errors.categoryId).toBe("Choose an active category.");
      expect(errors.imageUrl).toBe("Image URL must be a valid HTTPS address.");
    }
  });

  it("validates category slugs and Ethiopia-local store hours", () => {
    expect(categoryFormSchema.safeParse({ name: "Coffee", slug: "Coffee Drinks" }).success).toBe(false);
    expect(storeFormSchema.safeParse({ name: "K-Coffee Bole", address: "Bole Road", phone: "+251911000000", hours: { ...hours, mon: { open: "19:00", close: "07:00" } }, timezone: "Africa/Addis_Ababa", pickupIntervalMinutes: 20, pickupLeadTimeMinutes: 20, pickupCapacity: 10, coordinates: null }).success).toBe(false);
  });
});
