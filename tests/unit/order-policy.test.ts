import { describe, expect, it } from "vitest";
import { OrderStatus } from "@/app/generated/prisma/client";
import { canCancelOrder, canReadOrder, canTransitionOrder } from "@/lib/order-policy";
import { UserRole } from "@/lib/rbac";

const order = { userId: "customer-1", storeId: "store-1", status: OrderStatus.PENDING, createdAt: new Date("2026-08-22T09:00:00Z") };

describe("order policy", () => {
  it("keeps customer reads scoped to ownership", () => {
    expect(canReadOrder({ id: "customer-1", role: UserRole.USER }, order)).toBe(true);
    expect(canReadOrder({ id: "customer-2", role: UserRole.USER }, order)).toBe(false);
  });
  it("keeps cashiers scoped to their store", () => {
    expect(canReadOrder({ id: "cashier", role: UserRole.CASHIER, storeId: "store-1" }, order)).toBe(true);
    expect(canReadOrder({ id: "cashier", role: UserRole.CASHIER, storeId: "store-2" }, order)).toBe(false);
  });
  it("allows customer cancellation only during the pending 30-minute window", () => {
    expect(canCancelOrder({ id: "customer-1", role: UserRole.USER }, order, new Date("2026-08-22T09:30:00Z"))).toBe(true);
    expect(canCancelOrder({ id: "customer-1", role: UserRole.USER }, order, new Date("2026-08-22T09:30:01Z"))).toBe(false);
  });
  it("does not allow a cashier to skip lifecycle states", () => {
    const cashier = { id: "cashier", role: UserRole.CASHIER, storeId: "store-1" };
    expect(canTransitionOrder(cashier, order, OrderStatus.CONFIRMED)).toBe(true);
    expect(canTransitionOrder(cashier, order, OrderStatus.COMPLETED)).toBe(false);
  });
});
