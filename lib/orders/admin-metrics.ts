import "server-only";

import { OrderStatus } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";

import {
  activeOrderStatuses,
  buildDailyOrderValueTrend,
  getEthiopiaDateRange,
  orderStatusLabels,
} from "./admin-overview-policy";

const reportingDayCount = 7;
const activeUserWindowDays = 30;

export type AdminOverviewMetrics = Awaited<ReturnType<typeof getAdminOverviewMetrics>>;

export async function getAdminOverviewMetrics(now = new Date()) {
  const reportingRange = getEthiopiaDateRange(now, reportingDayCount);
  const activeUserSince = new Date(
    now.getTime() - activeUserWindowDays * 24 * 60 * 60 * 1000,
  );

  const [
    periodOrders,
    statusGroups,
    recent,
    activeUserCount,
    activeCustomerCount,
    activeStoreCount,
    totalStoreCount,
    activeCategoryCount,
    visibleProductCount,
    overduePickupCount,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: reportingRange.start, lt: reportingRange.end } },
      select: { createdAt: true, totalAmount: true, status: true, paymentStatus: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        pickupTime: true,
        store: { select: { name: true, timezone: true } },
      },
    }),
    prisma.user.count({
      where: {
        isActive: true,
        sessions: { some: { expiresAt: { gt: now }, updatedAt: { gte: activeUserSince } } },
      },
    }),
    prisma.user.count({
      where: {
        isActive: true,
        role: "USER",
        sessions: { some: { expiresAt: { gt: now }, updatedAt: { gte: activeUserSince } } },
      },
    }),
    prisma.storeLocation.count({ where: { isActive: true } }),
    prisma.storeLocation.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, category: { isActive: true } } }),
    prisma.order.count({
      where: {
        status: { in: [...activeOrderStatuses] },
        pickupTime: { lt: now },
      },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    statusGroups.map((item) => [item.status, item._count._all]),
  ) as Partial<Record<OrderStatus, number>>;
  const activeQueueCount = activeOrderStatuses.reduce(
    (total, status) => total + (statusCounts[status] ?? 0),
    0,
  );
  const readyForPickupCount = statusCounts[OrderStatus.READY_FOR_PICKUP] ?? 0;
  const nonCancelledPeriodOrders = periodOrders.filter(
    (order) => order.status !== OrderStatus.CANCELLED,
  );
  const completedPaidPeriodOrders = periodOrders.filter(
    (order) =>
      order.status === OrderStatus.COMPLETED && order.paymentStatus === "PAID",
  );
  const orderValue = nonCancelledPeriodOrders.reduce(
    (total, order) => total + Number(order.totalAmount),
    0,
  );
  const trend = buildDailyOrderValueTrend(
    periodOrders.map((order) => ({
      createdAt: order.createdAt,
      totalAmount: Number(order.totalAmount),
      status: order.status,
    })),
    now,
    reportingDayCount,
  );
  const menuAvailable = activeStoreCount > 0 && visibleProductCount > 0;
  const health = !menuAvailable
    ? {
        tone: "blocked" as const,
        label: "Menu unavailable",
        detail:
          activeStoreCount === 0
            ? "Activate at least one store before accepting pickup orders."
            : "Activate at least one product in an active category.",
      }
    : overduePickupCount > 0
      ? {
          tone: "attention" as const,
          label: "Pickup follow-up needed",
          detail: `${overduePickupCount} active ${overduePickupCount === 1 ? "order is" : "orders are"} past the scheduled pickup time.`,
        }
      : readyForPickupCount > 0
        ? {
            tone: "attention" as const,
            label: "Pickup handoff pending",
            detail: `${readyForPickupCount} ${readyForPickupCount === 1 ? "order is" : "orders are"} ready for collection.`,
          }
        : {
            tone: "ready" as const,
            label: "Service ready",
            detail: "The menu and at least one pickup location are available.",
          };

  return {
    generatedAt: now,
    reportingRange,
    reportingDayCount,
    activeUserWindowDays,
    orderValue,
    orderCount: nonCancelledPeriodOrders.length,
    completedPaidOrderCount: completedPaidPeriodOrders.length,
    activeUserCount,
    activeCustomerCount,
    activeQueueCount,
    readyForPickupCount,
    overduePickupCount,
    statusBreakdown: Object.values(OrderStatus).map((status) => ({
      status,
      label: orderStatusLabels[status],
      count: statusCounts[status] ?? 0,
    })),
    trend,
    health,
    catalogue: {
      activeStoreCount,
      totalStoreCount,
      activeCategoryCount,
      visibleProductCount,
    },
    recent: recent.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      statusLabel: orderStatusLabels[order.status],
    })),
  };
}
