import prisma from "./prisma";

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  context?: Record<string, any>; // For business logic checks
}

const ROLE_PERMISSIONS: Record<
  UserRole,
  Array<{ action: PermissionAction; resource: ResourceType }>
> = {
  [UserRole.SUPERADMIN]: [{ action: "manage", resource: "all" }],
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

// Initialize default permissions in database
export async function initializePermissions() {
  const permissions = Object.entries(ROLE_PERMISSIONS).flatMap(
    ([role, perms]) =>
      perms.map((perm) => ({
        action: perm.action,
        resource: perm.resource === "all" ? "*" : perm.resource,
        allowedRoles: [role as UserRole],
        description: `${role} can ${perm.action} ${perm.resource}`,
      }))
  );

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: {
        action_resource: { action: perm.action, resource: perm.resource },
      },
      update: {
        allowedRoles: { set: perm.allowedRoles },
        description: perm.description,
      },
      create: perm,
    });
  }

  console.log("Permissions initialized successfully");
}

export async function hasPermission({
  action,
  resource,
  userId,
  userRole,
  context = {},
}: PermissionCheck): Promise<boolean> {
  // SUPERADMIN has all permission
  if (userRole === UserRole.SUPERADMIN) return true;

  // Get permission from database
  const permission = await prisma.permission.findUnique({
    where: { action_resource: { action, resource } },
  });
  if (!permission) return false;

  // Check if role is allowed
  const roleAllowed = permission.allowedRoles.includes(userRole);
  if (!roleAllowed) return false;

  return applyBusinessRules({ action, resource, userId, userRole, context });
}

function applyBusinessRules({
  action,
  resource,
  userId,
  userRole,
  context,
}: PermissionCheck): boolean {
  if (action === "cancel" && resource === "orders") {
    if (userRole === UserRole.USER) {
      const orgerAge = context?.orgerAge ?? 0; // in minutes
      const isOwnOrder = context?.orderUserId === userId;
      return isOwnOrder && orgerAge <= 30;
    }
    return true;
  }

  if (action === "read" && resource === "orders") {
    if (userRole === UserRole.USER) {
      return context?.orderUserId === userId;
    }
    return true;
  }

  if (action === "process" && resource === "orders") {
    if (userRole === UserRole.CASHIER) {
      return context?.orderDate === new Date().toDateString();
    }
    return true;
  }
  return true;
}

// Log actions for audit trail
export async function logAudit(
  userId: string,
  userRole: UserRole,
  action: string,
  resource: string,
  details?: any
) {
  return prisma.auditLog.create({
    data: {
      userId,
      userRole,
      action,
      resource,
      details,
      ipAddress: details?.ipAddress,
      userAgent: details?.userAgent,
    },
  });
}

// Get user's permissions (for UI display)
export async function getUserPermissions(userId: string, userRole: UserRole) {
  const allPermissions = await prisma.permission.findMany({
    where: {
      OR: [{ allowedRoles: { has: userRole } }],
    },
  });

  return allPermissions.map((p) => ({
    action: p.action,
    resource: p.resource,
    description: p.description,
  }));
}
