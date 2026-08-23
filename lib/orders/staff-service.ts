import "server-only";
import { OrderStatus } from "@/app/generated/prisma/client";
import { type AuthenticatedActor, AuthorizationError } from "@/lib/authz";
import { canTransitionOrder, orderStatusTransitions } from "@/lib/order-policy";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

export class IllegalOrderTransitionError extends Error {
  constructor(currentStatus: OrderStatus, nextStatus: OrderStatus) {
    super(`Orders cannot move from ${currentStatus.replaceAll("_", " ")} to ${nextStatus.replaceAll("_", " ")}.`);
    this.name = "IllegalOrderTransitionError";
  }
}

async function scope(actor: AuthenticatedActor) {
  if (actor.role !== UserRole.CASHIER) return undefined;
  return (await prisma.staffStoreAssignment.findMany({ where: { userId: actor.id }, select: { storeId: true } })).map(({ storeId }) => storeId);
}

export async function getStaffQueue(actor: AuthenticatedActor) {
  const storeIds = await scope(actor);
  if (storeIds && !storeIds.length) return [];
  return prisma.order.findMany({ where: { ...(storeIds ? { storeId: { in: storeIds } } : {}), status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP"] } }, include: { store: { select: { name: true, timezone: true } }, items: { select: { quantity: true } } }, orderBy: { pickupTime: "asc" }, take: 100 });
}

export async function getStaffOrder(actor: AuthenticatedActor, orderId: string) {
  const storeIds = await scope(actor);
  if (storeIds && !storeIds.length) return null;
  return prisma.order.findFirst({
    where: { id: orderId, ...(storeIds ? { storeId: { in: storeIds } } : {}) },
    include: {
      store: { select: { id: true, name: true, address: true, timezone: true } },
      items: { include: { product: { select: { name: true } } } },
      user: { select: { name: true } },
    },
  });
}

export async function getStaffOrderAudit(actor: AuthenticatedActor, orderId: string) {
  const order = await getStaffOrder(actor, orderId);
  if (!order) return null;
  const audit = await prisma.auditLog.findMany({
    where: { resource: "orders", resourceId: orderId },
    select: { id: true, action: true, userRole: true, createdAt: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return { order, audit };
}

export async function transitionStaffOrder(actor: AuthenticatedActor, orderId: string, nextStatus: OrderStatus) {
  const storeIds = await scope(actor);
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || (storeIds && !storeIds.includes(order.storeId))) throw new AuthorizationError();
    if (!canTransitionOrder({ id: actor.id, role: actor.role, storeId: order.storeId }, order, nextStatus)) throw new IllegalOrderTransitionError(order.status, nextStatus);
    const updated = await tx.order.update({ where: { id: order.id }, data: { status: nextStatus, ...(nextStatus === "COMPLETED" ? { paymentStatus: "PAID" } : {}) }, select: { id: true, status: true } });
    await tx.auditLog.create({ data: { userId: actor.id, userRole: actor.role, action: "update", resource: "orders", resourceId: orderId, details: { before: order.status, after: nextStatus, storeId: order.storeId } } });
    return { ...updated, nextStatuses: orderStatusTransitions[nextStatus] };
  });
}
