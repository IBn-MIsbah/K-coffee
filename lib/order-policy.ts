import { OrderStatus } from "@/app/generated/prisma/client";
import { UserRole } from "@/lib/rbac";

export interface OrderActor {
  id: string;
  role: UserRole;
  storeId?: string | null;
}

export interface OrderPolicyRecord {
  userId: string | null;
  storeId: string;
  status: OrderStatus;
  createdAt: Date;
}

const transitionMap: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING],
  PREPARING: [OrderStatus.READY_FOR_PICKUP],
  READY_FOR_PICKUP: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

function hasStoreAccess(actor: OrderActor, order: OrderPolicyRecord) {
  return !actor.storeId || actor.storeId === order.storeId;
}

export function canReadOrder(actor: OrderActor, order: OrderPolicyRecord) {
  if (actor.role === UserRole.SUPERADMIN || actor.role === UserRole.ADMIN) {
    return true;
  }

  if (actor.role === UserRole.CASHIER) return hasStoreAccess(actor, order);
  return actor.role === UserRole.USER && order.userId === actor.id;
}

export function canCancelOrder(
  actor: OrderActor,
  order: OrderPolicyRecord,
  now: Date,
  cancellationWindowMinutes = 30
) {
  if (actor.role === UserRole.ADMIN || actor.role === UserRole.SUPERADMIN) {
    return order.status !== OrderStatus.COMPLETED;
  }

  const ageInMinutes = (now.getTime() - order.createdAt.getTime()) / 60_000;
  return (
    actor.role === UserRole.USER &&
    order.userId === actor.id &&
    order.status === OrderStatus.PENDING &&
    ageInMinutes >= 0 &&
    ageInMinutes <= cancellationWindowMinutes
  );
}

export function canTransitionOrder(
  actor: OrderActor,
  order: OrderPolicyRecord,
  nextStatus: OrderStatus
) {
  if (!transitionMap[order.status].includes(nextStatus)) return false;
  if (actor.role === UserRole.ADMIN || actor.role === UserRole.SUPERADMIN) {
    return true;
  }

  return actor.role === UserRole.CASHIER && hasStoreAccess(actor, order);
}

export { transitionMap as orderStatusTransitions };
