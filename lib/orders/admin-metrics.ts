import "server-only";
import prisma from "@/lib/prisma";

export async function getAdminOrderMetrics() {
  const [byStatus, totals, recent] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { totalAmount: true }, _count: { _all: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true, store: { select: { name: true } } } }),
  ]);
  return { byStatus: Object.fromEntries(byStatus.map((item) => [item.status, item._count._all])), salesTotal: totals._sum.totalAmount?.toFixed(2) ?? "0.00", orderCount: totals._count._all, recent };
}
