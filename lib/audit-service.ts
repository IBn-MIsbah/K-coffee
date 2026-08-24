import "server-only";
import { type Prisma } from "@/app/generated/prisma/client";
import { type AuditFilters } from "@/lib/audit-validation";
import prisma from "@/lib/prisma";

export async function listAuditEvents(filters: AuditFilters) {
  const where: Prisma.AuditLogWhereInput = {
    ...(filters.actor ? { user: { is: { OR: [{ name: { contains: filters.actor, mode: "insensitive" } }, { email: { contains: filters.actor, mode: "insensitive" } }] } } } : {}),
    ...(filters.role ? { userRole: filters.role } : {}), ...(filters.resource ? { resource: filters.resource } : {}), ...(filters.action ? { action: filters.action } : {}),
    ...(filters.from || filters.to ? { createdAt: { ...(filters.from ? { gte: ethiopiaDayStart(filters.from) } : {}), ...(filters.to ? { lte: ethiopiaDayEnd(filters.to) } : {}) } } : {}),
  };
  const events = await prisma.auditLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 51, skip: (filters.page - 1) * 50, select: { id: true, action: true, resource: true, resourceId: true, userRole: true, createdAt: true, user: { select: { name: true, email: true } } } });
  return { events: events.slice(0, 50), hasNextPage: events.length > 50 };
}

export async function getAuditEvent(eventId: string) {
  return prisma.auditLog.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      action: true,
      resource: true,
      resourceId: true,
      userRole: true,
      createdAt: true,
      details: true,
      user: { select: { name: true, email: true } },
    },
  });
}

function ethiopiaDayStart(date: string) { return new Date(`${date}T00:00:00+03:00`); }
function ethiopiaDayEnd(date: string) { return new Date(`${date}T23:59:59.999+03:00`); }
