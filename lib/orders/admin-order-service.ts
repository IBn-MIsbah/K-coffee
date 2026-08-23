import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { type AuthenticatedActor, AuthorizationError } from "@/lib/authz";
import { type AdminOrderFilters } from "@/lib/orders/admin-order-validation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

const pageSize = 25;

export async function getAdminOrderOperations(actor: AuthenticatedActor, filters: AdminOrderFilters) {
  if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.SUPERADMIN) throw new AuthorizationError();

  const where = whereFor(filters);
  const [orders, stores] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: pageSize + 1,
      skip: (filters.page - 1) * pageSize,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        paymentStatus: true,
        pickupTime: true,
        createdAt: true,
        store: { select: { name: true, timezone: true } },
      },
    }),
    prisma.storeLocation.findMany({ select: { id: true, name: true, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const hasNextPage = orders.length > pageSize;
  return { orders: orders.slice(0, pageSize), stores, hasNextPage, pageSize };
}

function ethiopiaDayStart(date: string) {
  return new Date(`${date}T00:00:00+03:00`);
}

function ethiopiaDayEnd(date: string) {
  return new Date(`${date}T23:59:59.999+03:00`);
}

function whereFor(filters: AdminOrderFilters): Prisma.OrderWhereInput {
  return {
    ...(filters.storeId ? { storeId: filters.storeId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.from || filters.to ? {
      createdAt: {
        ...(filters.from ? { gte: ethiopiaDayStart(filters.from) } : {}),
        ...(filters.to ? { lte: ethiopiaDayEnd(filters.to) } : {}),
      },
    } : {}),
    ...(filters.query ? {
      OR: [
        { orderNumber: filters.query },
        { user: { is: { name: { equals: filters.query, mode: "insensitive" } } } },
      ],
    } : {}),
  };
}
