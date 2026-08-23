import { describe, expect, it } from "vitest";
import { OrderTransitionValidationError, parseStaffOrderTransition } from "@/lib/orders/order-validation";

describe("staff order transition validation", () => {
  it("accepts a defined order status", () => {
    expect(parseStaffOrderTransition({ nextStatus: "PREPARING" })).toEqual({ nextStatus: "PREPARING" });
  });

  it("rejects missing and unsupported statuses with a clear error", () => {
    expect(() => parseStaffOrderTransition({})).toThrow(OrderTransitionValidationError);
    expect(() => parseStaffOrderTransition({ nextStatus: "REFUNDED" })).toThrow(OrderTransitionValidationError);
  });
});
