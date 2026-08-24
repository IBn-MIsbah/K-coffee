import { OrderStatus } from "@/app/generated/prisma/client";

export const customerActiveOrderStatuses = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
] as const;

const statusPriority: Record<OrderStatus, number> = {
  [OrderStatus.READY_FOR_PICKUP]: 0,
  [OrderStatus.PREPARING]: 1,
  [OrderStatus.CONFIRMED]: 2,
  [OrderStatus.PENDING]: 3,
  [OrderStatus.COMPLETED]: Number.MAX_SAFE_INTEGER,
  [OrderStatus.CANCELLED]: Number.MAX_SAFE_INTEGER,
};

type ActiveOrderCandidate = {
  status: OrderStatus;
  pickupTime: Date | null;
  createdAt: Date;
};

/** Returns the order that most needs the customer's attention. */
export function selectActivePickupOrder<T extends ActiveOrderCandidate>(orders: T[]) {
  return [...orders].sort((left, right) => {
    const statusDifference = statusPriority[left.status] - statusPriority[right.status];
    if (statusDifference !== 0) return statusDifference;

    const leftPickup = left.pickupTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightPickup = right.pickupTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (leftPickup !== rightPickup) return leftPickup - rightPickup;

    return right.createdAt.getTime() - left.createdAt.getTime();
  })[0] ?? null;
}
