import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getAuditEvent, listAuditEvents } from "@/lib/audit-service";
import { parseAuditFilters } from "@/lib/audit-validation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

const prefix = "integration-audit-operations";
const actor = { id: "", email: `${prefix}@k-coffee.test` };

async function removeFixtures() {
  await prisma.auditLog.deleteMany({ where: { user: { email: actor.email } } });
  await prisma.user.deleteMany({ where: { email: actor.email } });
}

beforeEach(async () => {
  await removeFixtures();
  const user = await prisma.user.create({ data: { id: randomUUID(), email: actor.email, name: "Audit Integration Admin", role: UserRole.SUPERADMIN } });
  actor.id = user.id;

  await prisma.auditLog.createMany({
    data: Array.from({ length: 51 }, (_, index) => ({
      userId: actor.id,
      userRole: UserRole.SUPERADMIN,
      action: "review",
      resource: "audit-fixture",
      resourceId: `${prefix}-${index}`,
      details: { before: "PENDING", after: "CONFIRMED", sequence: index },
      createdAt: new Date(`2026-08-22T${String(index % 10).padStart(2, "0")}:00:00.000Z`),
    })),
  });
  await prisma.auditLog.create({ data: { userId: actor.id, userRole: UserRole.SUPERADMIN, action: "review", resource: "audit-fixture", resourceId: `${prefix}-ethiopia-included`, createdAt: new Date("2026-08-21T20:59:59.999Z") } });
  await prisma.auditLog.create({ data: { userId: actor.id, userRole: UserRole.SUPERADMIN, action: "review", resource: "audit-fixture", resourceId: `${prefix}-ethiopia-excluded`, createdAt: new Date("2026-08-21T21:00:00.000Z") } });
});

afterAll(async () => {
  await removeFixtures();
  await prisma.$disconnect();
});

describe("audit operations", () => {
  it("uses actor, role, action, and resource filters with deterministic pagination", async () => {
    const first = await listAuditEvents(parseAuditFilters({ actor: "integration admin", role: "SUPERADMIN", action: "review", resource: "audit-fixture", page: "1" }));
    const second = await listAuditEvents(parseAuditFilters({ actor: "integration admin", role: "SUPERADMIN", action: "review", resource: "audit-fixture", page: "2" }));

    expect(first.events).toHaveLength(50);
    expect(first.hasNextPage).toBe(true);
    expect(second.events).toHaveLength(3);
    expect(second.hasNextPage).toBe(false);
    expect(first.events.every((event) => event.user?.email === actor.email)).toBe(true);
  });

  it("uses Ethiopia-local date boundaries and retrieves immutable event details", async () => {
    const day = await listAuditEvents(parseAuditFilters({ resource: "audit-fixture", from: "2026-08-21", to: "2026-08-21" }));
    const included = day.events.find((event) => event.resourceId === `${prefix}-ethiopia-included`);

    expect(day.events.map((event) => event.resourceId)).toContain(`${prefix}-ethiopia-included`);
    expect(day.events.map((event) => event.resourceId)).not.toContain(`${prefix}-ethiopia-excluded`);
    expect(included).toBeDefined();

    const detail = await getAuditEvent(included!.id);
    expect(detail).toMatchObject({ id: included!.id, action: "review", resource: "audit-fixture" });
  });
});
