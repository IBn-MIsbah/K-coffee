import "server-only";

import { auth } from "@/lib/auth";
import {
  hasPermission,
  logAudit,
  type PermissionAction,
  type ResourceType,
  UserRole,
} from "@/lib/rbac";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginUrlFor } from "./return-to";

export { safeReturnTo } from "./return-to";

export interface AuthenticatedActor {
  id: string;
  email: string | null | undefined;
  name: string | null | undefined;
  role: UserRole;
}

export class AuthenticationError extends Error {
  constructor() {
    super("You must sign in to continue.");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor() {
    super("You do not have permission to perform this action.");
    this.name = "AuthorizationError";
  }
}

const knownRoles = new Set(Object.values(UserRole));

function toActor(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}): AuthenticatedActor | null {
  if (!user.role || !knownRoles.has(user.role as UserRole)) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  };
}

export async function getCurrentActor(): Promise<AuthenticatedActor | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return toActor(session.user);
}

export async function requireActor(): Promise<AuthenticatedActor> {
  const actor = await getCurrentActor();
  if (!actor) throw new AuthenticationError();
  return actor;
}

export async function requireRole(
  allowedRoles: readonly UserRole[]
): Promise<AuthenticatedActor> {
  const actor = await requireActor();
  if (!allowedRoles.includes(actor.role)) throw new AuthorizationError();
  return actor;
}

export async function requirePermission({
  action,
  resource,
  context,
}: {
  action: PermissionAction;
  resource: ResourceType;
  context?: Record<string, unknown>;
}): Promise<AuthenticatedActor> {
  const actor = await requireActor();
  const allowed = await hasPermission({
    action,
    resource,
    userId: actor.id,
    userRole: actor.role,
    context,
  });

  if (!allowed) {
    try {
      await logAudit(actor.id, actor.role, `denied:${action}`, resource, {
        reason: "missing_permission",
      });
    } catch (error) {
      console.error("Failed to record denied authorization attempt", error);
    }
    throw new AuthorizationError();
  }
  return actor;
}

export async function requirePageSession(returnTo?: string): Promise<AuthenticatedActor> {
  try {
    return await requireActor();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      redirect(loginUrlFor(returnTo));
    }
    redirect("/unauthorized");
  }
}

export async function requirePageRole(
  allowedRoles: readonly UserRole[],
  returnTo?: string
): Promise<AuthenticatedActor> {
  try {
    return await requireRole(allowedRoles);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      redirect(loginUrlFor(returnTo));
    }
    redirect("/unauthorized");
  }
}
