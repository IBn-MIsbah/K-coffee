import "server-only";

import { type AuthenticatedActor, AuthorizationError } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";
import { listCustomerFavoriteProducts } from "@/lib/favorites/favorite-service";
import prisma from "@/lib/prisma";
import { customerActiveOrderStatuses, selectActivePickupOrder } from "./customer-dashboard-policy";

const orderSelect = {
  id: true,
  userId: true,
  storeId: true,
  orderNumber: true,
  status: true,
  totalAmount: true,
  pickupTime: true,
  createdAt: true,
  store: { select: { name: true, address: true, timezone: true } },
  items: { select: { quantity: true } },
} as const;

export async function getCustomerDashboard(actor: AuthenticatedActor) {
  if (actor.role !== UserRole.USER) throw new AuthorizationError();

  const [activeCandidates, recentOrders, favoriteProducts] = await Promise.all([
    prisma.order.findMany({
      where: { userId: actor.id, status: { in: [...customerActiveOrderStatuses] } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: orderSelect,
    }),
    prisma.order.findMany({
      where: { userId: actor.id, status: { in: ["COMPLETED", "CANCELLED"] } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: orderSelect,
    }),
    listCustomerFavoriteProducts(actor),
  ]);

  return { activeOrder: selectActivePickupOrder(activeCandidates), recentOrders, favoriteProducts: favoriteProducts.map((favorite) => favorite.product) };
}
