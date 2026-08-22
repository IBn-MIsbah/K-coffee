import "server-only";
import { OrderStatus } from "@/app/generated/prisma/client";
import { type AuthenticatedActor, AuthorizationError } from "@/lib/authz";
import { canTransitionOrder, orderStatusTransitions } from "@/lib/order-policy";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

async function scope(actor: AuthenticatedActor) {
  if (actor.role !== UserRole.CASHIER) return undefined;
  return (await prisma.staffStoreAssignment.findMany({ where: { userId: actor.id }, select: { storeId: true } })).map(({ storeId }) => storeId);
}

export async function getStaffQueue(actor: AuthenticatedActor) {
  const storeIds = await scope(actor);
  if (storeIds && !storeIds.length) return [];
  return prisma.order.findMany({ where: { ...(storeIds ? { storeId: { in: storeIds } } : {}), status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP"] } }, include: { store: { select: { name: true, timezone: true } }, items: { select: { quantity: true } } }, orderBy: { pickupTime: "asc" }, take: 100 });
}

export async function transitionStaffOrder(actor: AuthenticatedActor, orderId: string, nextStatus: OrderStatus) {
  const allowed = new Set(Object.values(OrderStatus));
  if (!allowed.has(nextStatus)) throw new AuthorizationError();
  const storeIds = await scope(actor);
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || (storeIds && !storeIds.includes(order.storeId)) || !canTransitionOrder({ id: actor.id, role: actor.role, storeId: order.storeId }, order, nextStatus)) throw new AuthorizationError();
    const updated = await tx.order.update({ where: { id: order.id }, data: { status: nextStatus, ...(nextStatus === "COMPLETED" ? { paymentStatus: "PAID" } : {}) }, select: { id: true, status: true } });
    await tx.auditLog.create({ data: { userId: actor.id, userRole: actor.role, action: "update", resource: "orders", resourceId: orderId, details: { before: order.status, after: nextStatus, storeId: order.storeId } } });
    return { ...updated, nextStatuses: orderStatusTransitions[nextStatus] };
  });
}
