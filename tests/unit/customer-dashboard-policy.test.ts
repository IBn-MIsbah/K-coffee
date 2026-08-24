import { OrderStatus } from "@/app/generated/prisma/client";
import { describe, expect, it } from "vitest";
import { selectActivePickupOrder } from "@/lib/dashboard/customer-dashboard-policy";

const createdAt = new Date("2026-08-24T08:00:00Z");

describe("customer dashboard active-order selection", () => {
  it("prioritizes an order ready for pickup over earlier lifecycle stages", () => {
    const selected = selectActivePickupOrder([
      { id: "pending", status: OrderStatus.PENDING, pickupTime: new Date("2026-08-24T08:20:00Z"), createdAt },
      { id: "ready", status: OrderStatus.READY_FOR_PICKUP, pickupTime: new Date("2026-08-24T09:00:00Z"), createdAt },
      { id: "preparing", status: OrderStatus.PREPARING, pickupTime: new Date("2026-08-24T08:40:00Z"), createdAt },
    ]);

    expect(selected?.id).toBe("ready");
  });

  it("uses the earliest pickup time within the same status", () => {
    const selected = selectActivePickupOrder([
      { id: "later", status: OrderStatus.CONFIRMED, pickupTime: new Date("2026-08-24T10:00:00Z"), createdAt },
      { id: "earlier", status: OrderStatus.CONFIRMED, pickupTime: new Date("2026-08-24T09:00:00Z"), createdAt },
    ]);

    expect(selected?.id).toBe("earlier");
  });

  it("returns null when the customer has no active orders", () => {
    expect(selectActivePickupOrder([])).toBeNull();
  });
});
