import "server-only";

import { type AuthenticatedActor, AuthorizationError } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

function requireCustomer(actor: AuthenticatedActor) {
  if (actor.role !== UserRole.USER) throw new AuthorizationError();
}

export async function listCustomerNotifications(actor: AuthenticatedActor) {
  requireCustomer(actor);

  return prisma.appNotification.findMany({
    where: { userId: actor.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      body: true,
      href: true,
      readAt: true,
      createdAt: true,
    },
  });
}

export async function markCustomerNotificationRead(
  actor: AuthenticatedActor,
  notificationId: string,
) {
  requireCustomer(actor);

  const updated = await prisma.appNotification.updateMany({
    where: { id: notificationId, userId: actor.id, readAt: null },
    data: { readAt: new Date() },
  });

  return updated.count > 0;
}
