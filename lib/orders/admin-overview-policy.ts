import { OrderStatus } from "@/app/generated/prisma/client";

export const ETHIOPIA_TIME_ZONE = "Africa/Addis_Ababa";

const ETHIOPIA_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const activeOrderStatuses: readonly OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
];

export const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.CONFIRMED]: "Confirmed",
  [OrderStatus.PREPARING]: "Preparing",
  [OrderStatus.READY_FOR_PICKUP]: "Ready for pickup",
  [OrderStatus.COMPLETED]: "Completed",
  [OrderStatus.CANCELLED]: "Cancelled",
};

export type OrderValueEvent = {
  createdAt: Date;
  totalAmount: number;
  status: OrderStatus;
};

export type DailyOrderValue = {
  dateKey: string;
  label: string;
  shortLabel: string;
  orderCount: number;
  value: number;
};

/**
 * Ethiopia has a fixed UTC+03:00 offset. Keeping the date math local to the
 * store's operating timezone prevents a late-night UTC order from being put
 * into the wrong operational day.
 */
export function ethiopiaDayStart(date: Date) {
  const localDate = new Date(date.getTime() + ETHIOPIA_UTC_OFFSET_MS);

  return new Date(
    Date.UTC(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate(),
    ) - ETHIOPIA_UTC_OFFSET_MS,
  );
}

export function addEthiopiaDays(dayStart: Date, days: number) {
  return new Date(dayStart.getTime() + days * DAY_MS);
}

export function ethiopiaDateKey(date: Date) {
  const localDate = new Date(date.getTime() + ETHIOPIA_UTC_OFFSET_MS);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localDate.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getEthiopiaDateRange(now: Date, dayCount: number) {
  const end = addEthiopiaDays(ethiopiaDayStart(now), 1);
  const start = addEthiopiaDays(end, -dayCount);

  return { start, end };
}

export function buildDailyOrderValueTrend(
  orders: readonly OrderValueEvent[],
  now: Date,
  dayCount = 7,
): DailyOrderValue[] {
  const { start, end } = getEthiopiaDateRange(now, dayCount);
  const valuesByDate = new Map<string, { orderCount: number; value: number }>();

  for (const order of orders) {
    if (
      order.status === OrderStatus.CANCELLED ||
      order.createdAt < start ||
      order.createdAt >= end
    ) {
      continue;
    }

    const dateKey = ethiopiaDateKey(order.createdAt);
    const current = valuesByDate.get(dateKey) ?? { orderCount: 0, value: 0 };

    valuesByDate.set(dateKey, {
      orderCount: current.orderCount + 1,
      value: current.value + order.totalAmount,
    });
  }

  const dayFormatter = new Intl.DateTimeFormat("en-ET", {
    timeZone: ETHIOPIA_TIME_ZONE,
    weekday: "short",
  });
  const fullDayFormatter = new Intl.DateTimeFormat("en-ET", {
    timeZone: ETHIOPIA_TIME_ZONE,
    day: "numeric",
    month: "short",
  });

  return Array.from({ length: dayCount }, (_, index) => {
    const dayStart = addEthiopiaDays(start, index);
    const dateKey = ethiopiaDateKey(dayStart);
    const value = valuesByDate.get(dateKey) ?? { orderCount: 0, value: 0 };

    return {
      dateKey,
      shortLabel: dayFormatter.format(dayStart),
      label: fullDayFormatter.format(dayStart),
      ...value,
    };
  });
}
