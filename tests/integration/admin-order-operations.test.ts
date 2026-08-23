import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "@/app/generated/prisma/client";
import { getAdminOrderOperations } from "@/lib/orders/admin-order-service";
import { parseAdminOrderFilters } from "@/lib/orders/admin-order-validation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

const prefix = "integration-admin-orders";
const admin = { id: "", email: `${prefix}@k-coffee.test`, name: "Integration Admin", role: UserRole.ADMIN };
const storeId = `${prefix}-store`;

async function removeFixtures() {
  await prisma.orderItem.deleteMany({ where: { order: { orderNumber: { startsWith: prefix } } } });
  await prisma.order.deleteMany({ where: { orderNumber: { startsWith: prefix } } });
  await prisma.storeLocation.deleteMany({ where: { id: storeId } });
}

beforeEach(async () => {
  await removeFixtures();
  const user = await prisma.user.upsert({
    where: { email: admin.email },
    update: { role: UserRole.ADMIN },
    create: { id: randomUUID(), email: admin.email, name: admin.name, role: UserRole.ADMIN },
    select: { id: true },
  });
  admin.id = user.id;

  const store = await prisma.storeLocation.create({ data: { id: storeId, name: "Integration reporting store", address: "Addis Ababa", phone: "+251000000000", timezone: "Africa/Addis_Ababa", hours: {} } });
  await prisma.order.createMany({
    data: [
      ...Array.from({ length: 26 }, (_, index) => ({ orderNumber: `${prefix}-page-${index}`, storeId: store.id, totalAmount: new Prisma.Decimal("10"), createdAt: new Date(`2026-08-22T${String(index % 10).padStart(2, "0")}:00:00.000Z`) })),
      { orderNumber: `${prefix}-ethiopia-included`, storeId: store.id, totalAmount: new Prisma.Decimal("15"), createdAt: new Date("2026-08-21T20:59:59.999Z") },
      { orderNumber: `${prefix}-ethiopia-excluded`, storeId: store.id, totalAmount: new Prisma.Decimal("20"), createdAt: new Date("2026-08-21T21:00:00.000Z") },
    ],
  });
});

afterAll(async () => {
  await removeFixtures();
  await prisma.$disconnect();
});

describe("admin order operations", () => {
  it("uses bounded deterministic pagination and exact order lookup", async () => {
    const firstPage = await getAdminOrderOperations(admin, parseAdminOrderFilters({ page: "1", storeId }));
    const secondPage = await getAdminOrderOperations(admin, parseAdminOrderFilters({ page: "2", storeId }));
    const exact = await getAdminOrderOperations(admin, parseAdminOrderFilters({ storeId, query: `${prefix}-page-3` }));

    expect(firstPage.orders).toHaveLength(25);
    expect(firstPage.hasNextPage).toBe(true);
    expect(secondPage.orders).toHaveLength(3);
    expect(secondPage.hasNextPage).toBe(false);
    expect(exact.orders.map((order) => order.orderNumber)).toEqual([`${prefix}-page-3`]);
  });

  it("uses the Ethiopia-local calendar day for date filters", async () => {
    const result = await getAdminOrderOperations(admin, parseAdminOrderFilters({ storeId, from: "2026-08-21", to: "2026-08-21" }));
    const numbers = result.orders.map((order) => order.orderNumber);

    expect(numbers).toContain(`${prefix}-ethiopia-included`);
    expect(numbers).not.toContain(`${prefix}-ethiopia-excluded`);
  });
});
