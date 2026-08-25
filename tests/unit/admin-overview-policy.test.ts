import { OrderStatus } from "@/app/generated/prisma/client";
import {
  buildDailyOrderValueTrend,
  ethiopiaDayStart,
  getEthiopiaDateRange,
} from "@/lib/orders/admin-overview-policy";
import { describe, expect, it } from "vitest";

describe("admin overview date policy", () => {
  const now = new Date("2026-08-25T12:00:00.000Z");

  it("uses Ethiopia-local midnight for a seven-day reporting range", () => {
    const { start, end } = getEthiopiaDateRange(now, 7);

    expect(start.toISOString()).toBe("2026-08-18T21:00:00.000Z");
    expect(end.toISOString()).toBe("2026-08-25T21:00:00.000Z");
    expect(
      ethiopiaDayStart(new Date("2026-08-25T20:59:59.999Z")).toISOString(),
    ).toBe("2026-08-24T21:00:00.000Z");
  });

  it("groups order value by Ethiopia-local day and excludes cancelled orders", () => {
    const trend = buildDailyOrderValueTrend(
      [
        {
          createdAt: new Date("2026-08-18T21:00:00.000Z"),
          totalAmount: 10,
          status: OrderStatus.PENDING,
        },
        {
          createdAt: new Date("2026-08-19T20:59:59.999Z"),
          totalAmount: 15,
          status: OrderStatus.COMPLETED,
        },
        {
          createdAt: new Date("2026-08-19T21:00:00.000Z"),
          totalAmount: 100,
          status: OrderStatus.CANCELLED,
        },
        {
          createdAt: new Date("2026-08-25T21:00:00.000Z"),
          totalAmount: 25,
          status: OrderStatus.PREPARING,
        },
      ],
      now,
    );

    expect(trend).toHaveLength(7);
    expect(trend[0]).toMatchObject({
      dateKey: "2026-08-19",
      orderCount: 2,
      value: 25,
    });
    expect(trend[1]).toMatchObject({
      dateKey: "2026-08-20",
      orderCount: 0,
      value: 0,
    });
    expect(trend[6]).toMatchObject({
      dateKey: "2026-08-25",
      orderCount: 0,
      value: 0,
    });
  });
});
