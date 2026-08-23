import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { AuthenticatedActor } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { parseStoreInput, type StoreInput } from "./store-validation";

export const adminStoreSelect = {
  id: true,
  name: true,
  address: true,
  phone: true,
  hours: true,
  timezone: true,
  pickupIntervalMinutes: true,
  pickupLeadTimeMinutes: true,
  pickupCapacity: true,
  coordinates: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.StoreLocationSelect;

function auditDetails(store: StoreInput) {
  return {
    name: store.name,
    isActive: true,
    timezone: store.timezone,
    pickupIntervalMinutes: store.pickupIntervalMinutes,
    pickupLeadTimeMinutes: store.pickupLeadTimeMinutes,
    pickupCapacity: store.pickupCapacity,
  } satisfies Prisma.InputJsonValue;
}

function data(store: StoreInput) {
  return {
    ...store,
    hours: store.hours as Prisma.InputJsonValue,
  };
}

export async function listAdminStores() {
  return prisma.storeLocation.findMany({
    select: adminStoreSelect,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export async function getAdminStore(storeId: string) {
  return prisma.storeLocation.findUnique({ where: { id: storeId }, select: adminStoreSelect });
}

export async function createAdminStore(actor: AuthenticatedActor, input: unknown) {
  const store = parseStoreInput(input);
  return prisma.$transaction(async (tx) => {
    const created = await tx.storeLocation.create({ data: data(store), select: adminStoreSelect });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        userRole: actor.role,
        action: "create",
        resource: "stores",
        resourceId: created.id,
        details: auditDetails(store),
      },
    });
    return created;
  });
}

export async function updateAdminStore(actor: AuthenticatedActor, storeId: string, input: unknown) {
  const store = parseStoreInput(input);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.storeLocation.update({ where: { id: storeId }, data: data(store), select: adminStoreSelect });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        userRole: actor.role,
        action: "update",
        resource: "stores",
        resourceId: updated.id,
        details: auditDetails(store),
      },
    });
    return updated;
  });
}

export async function setAdminStoreActive(actor: AuthenticatedActor, storeId: string, isActive: boolean) {
  return prisma.$transaction(async (tx) => {
    const store = await tx.storeLocation.findUnique({ where: { id: storeId }, select: { id: true, name: true, isActive: true } });
    if (!store) return null;
    if (!isActive) {
      const activeOrders = await tx.order.count({
        where: {
          storeId,
          status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP"] },
        },
      });
      if (activeOrders > 0) throw new StoreArchiveConflictError();
    }
    const updated = await tx.storeLocation.update({ where: { id: storeId }, data: { isActive }, select: adminStoreSelect });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        userRole: actor.role,
        action: isActive ? "restore" : "archive",
        resource: "stores",
        resourceId: updated.id,
        details: { name: updated.name, isActive },
      },
    });
    return updated;
  });
}

export class StoreArchiveConflictError extends Error {
  constructor() {
    super("This store has active pickup orders and cannot be archived.");
    this.name = "StoreArchiveConflictError";
  }
}
