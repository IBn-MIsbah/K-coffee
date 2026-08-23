import { describe, expect, it } from "vitest";
import { CustomerOrderHistoryFilterError, parseCustomerOrderHistoryFilters } from "@/lib/orders/customer-order-validation";

describe("customer order-history filters", () => {
  it("defaults to active orders and accepts the supported history views", () => {
    expect(parseCustomerOrderHistoryFilters({})).toEqual({ view: "ACTIVE" });
    expect(parseCustomerOrderHistoryFilters({ view: "COMPLETED" })).toEqual({ view: "COMPLETED" });
  });

  it("rejects unexpected history views", () => {
    expect(() => parseCustomerOrderHistoryFilters({ view: "REFUNDED" })).toThrow(CustomerOrderHistoryFilterError);
  });
});
