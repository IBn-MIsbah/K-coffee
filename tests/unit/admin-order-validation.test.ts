import { describe, expect, it } from "vitest";
import { AdminOrderFilterError, parseAdminOrderFilters } from "@/lib/orders/admin-order-validation";

describe("admin order filters", () => {
  it("normalizes empty form fields and valid bounded filters", () => {
    expect(parseAdminOrderFilters({ page: "2", storeId: "", status: "", query: " ORD-42 ", from: "2026-08-01", to: "2026-08-23" })).toEqual({ page: 2, query: "ORD-42", from: "2026-08-01", to: "2026-08-23" });
  });

  it("rejects invalid status, inverted dates, and excessive date ranges", () => {
    expect(() => parseAdminOrderFilters({ status: "REFUNDED" })).toThrow(AdminOrderFilterError);
    expect(() => parseAdminOrderFilters({ from: "2026-08-23", to: "2026-08-01" })).toThrow("start date must be on or before");
    expect(() => parseAdminOrderFilters({ from: "2026-01-01", to: "2026-05-01" })).toThrow("93 days or fewer");
  });
});
