import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  CASHIER = "CASHIER",
}

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "cancel"
  | "process"
  | "view_all";

export type ResourceType =
  | "orders"
  | "products"
  | "categories"
  | "reservations"
  | "users"
  | "stores"
  | "analytics"
  | "all";

export interface PermissionCheck {
  action: PermissionAction;
  resource: ResourceType;
  userId: string;
  userRole: UserRole;
  context?: Record<string, unknown>;
}

type PermissionDefinition = {
  action: PermissionAction;
  resource: Exclude<ResourceType, "all">;
};

const rolePermissions: Record<UserRole, readonly PermissionDefinition[]> = {
  [UserRole.SUPERADMIN]: [],
  [UserRole.ADMIN]: [
    { action: "manage", resource: "orders" },
    { action: "manage", resource: "products" },
    { action: "manage", resource: "categories" },
    { action: "manage", resource: "reservations" },
    { action: "read", resource: "users" },
    { action: "manage", resource: "stores" },
    { action: "view_all", resource: "analytics" },
  ],
  [UserRole.CASHIER]: [
    { action: "create", resource: "orders" },
    { action: "read", resource: "orders" },
    { action: "update", resource: "orders" },
    { action: "process", resource: "orders" },
    { action: "read", resource: "products" },
    { action: "create", resource: "reservations" },
    { action: "read", resource: "reservations" },
    { action: "update", resource: "reservations" },
  ],
  [UserRole.USER]: [
    { action: "create", resource: "orders" },
    { action: "read", resource: "orders" },
    { action: "cancel", resource: "orders" },
    { action: "create", resource: "reservations" },
    { action: "read", resource: "reservations" },
    { action: "cancel", resource: "reservations" },
    { action: "read", resource: "products" },
  ],
};

export const permissionMatrix = Object.values(UserRole).reduce<
  Map<string, { action: PermissionAction; resource: string; allowedRoles: UserRole[] }>
>((matrix, role) => {
  for (const permission of rolePermissions[role]) {
    const key = `${permission.action}:${permission.resource}`;
    const current = matrix.get(key);
    if (current) {
      current.allowedRoles.push(role);
    } else {
      matrix.set(key, {
        action: permission.action,
        resource: permission.resource,
        allowedRoles: [role],
      });
    }
  }
  return matrix;
}, new Map());

export async function synchronizePermissions() {
  const permissions = [...permissionMatrix.values()];

  await prisma.$transaction(async (tx) => {
    for (const permission of permissions) {
      await tx.permission.upsert({
        where: {
          action_resource: {
            action: permission.action,
            resource: permission.resource,
          },
        },
        update: {
          allowedRoles: { set: permission.allowedRoles },
          description: `${permission.action} ${permission.resource}`,
        },
        create: {
          action: permission.action,
          resource: permission.resource,
          allowedRoles: permission.allowedRoles,
          description: `${permission.action} ${permission.resource}`,
        },
      });
    }

    await tx.permission.deleteMany({
      where: {
        NOT: {
          OR: permissions.map(({ action, resource }) => ({ action, resource })),
        },
      },
    });
  });
}

// Backwards-compatible name used by the seed script.
export const initializePermissions = synchronizePermissions;

export async function hasPermission({
  action,
  resource,
  userRole,
}: PermissionCheck): Promise<boolean> {
  if (userRole === UserRole.SUPERADMIN) return true;
  if (resource === "all") return false;

  const permission = await prisma.permission.findUnique({
    where: { action_resource: { action, resource } },
  });

  return permission?.allowedRoles.includes(userRole) ?? false;
}

export async function logAudit(
  userId: string,
  userRole: UserRole,
  action: string,
  resource: string,
  details?: Prisma.InputJsonValue
) {
  return prisma.auditLog.create({
    data: {
      userId,
      userRole,
      action,
      resource,
      details,
    },
  });
}

export async function getUserPermissions(userRole: UserRole) {
  if (userRole === UserRole.SUPERADMIN) {
    return [{ action: "manage", resource: "all", description: "Full access" }];
  }

  return prisma.permission.findMany({
    where: { allowedRoles: { has: userRole } },
    select: { action: true, resource: true, description: true },
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });
}
