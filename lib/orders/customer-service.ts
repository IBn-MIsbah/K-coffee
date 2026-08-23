import "server-only";
import { type AuthenticatedActor, AuthorizationError } from "@/lib/authz";
import { canCancelOrder } from "@/lib/order-policy";
import { customerOrderHistoryStatuses, type CustomerOrderHistoryFilters } from "@/lib/orders/customer-order-validation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

export async function listCustomerOrders(actor: AuthenticatedActor, filters: CustomerOrderHistoryFilters) {
  if (actor.role !== UserRole.USER) throw new AuthorizationError();
  return prisma.order.findMany({
    where: { userId: actor.id, ...(customerOrderHistoryStatuses[filters.view] ? { status: { in: customerOrderHistoryStatuses[filters.view] } } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      store: { select: { name: true, timezone: true } },
      items: { select: { quantity: true } },
    },
  });
}
export async function getCustomerOrder(
  actor: AuthenticatedActor,
  orderId: string,
) {
  if (actor.role !== UserRole.USER) throw new AuthorizationError();
  return prisma.order.findFirst({
    where: { id: orderId, userId: actor.id },
    include: {
      store: { select: { name: true, address: true, timezone: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });
}
export function canCustomerCancel(
  actor: AuthenticatedActor,
  order: Parameters<typeof canCancelOrder>[1],
) {
  return canCancelOrder(actor, order, new Date());
}
export async function cancelCustomerOrder(
  actor: AuthenticatedActor,
  orderId: string,
) {
  if (actor.role !== UserRole.USER) throw new AuthorizationError();
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId: actor.id },
    });
    if (!order || !canCancelOrder(actor, order, new Date()))
      throw new AuthorizationError();
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", paymentStatus: "VOID" },
      select: { id: true, status: true },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        userRole: actor.role,
        action: "cancel",
        resource: "orders",
        resourceId: order.id,
        details: { before: order.status, after: "CANCELLED" },
      },
    });
    return updated;
  });
}
