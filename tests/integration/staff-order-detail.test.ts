import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "@/app/generated/prisma/client";
import { getStaffOrderAudit } from "@/lib/orders/staff-service";
import { UserRole } from "@/lib/rbac";
import prisma from "@/lib/prisma";

const prefix = "integration-staff-detail";
const cashier = { id: "", email: `${prefix}@k-coffee.test`, name: "Integration Cashier", role: UserRole.CASHIER };
let assignedOrderId = "";
let otherStoreOrderId = "";

beforeEach(async () => {
  await prisma.auditLog.deleteMany({ where: { user: { email: cashier.email } } });
  await prisma.orderItem.deleteMany({ where: { order: { orderNumber: { startsWith: prefix } } } });
  await prisma.order.deleteMany({ where: { orderNumber: { startsWith: prefix } } });
  await prisma.staffStoreAssignment.deleteMany({ where: { user: { email: cashier.email } } });
  await prisma.product.deleteMany({ where: { name: `${prefix} product` } });
  await prisma.category.deleteMany({ where: { slug: prefix } });
  await prisma.storeLocation.deleteMany({ where: { id: { startsWith: prefix } } });

  const user = await prisma.user.upsert({
    where: { email: cashier.email },
    update: { role: UserRole.CASHIER },
    create: { id: randomUUID(), email: cashier.email, name: cashier.name, role: UserRole.CASHIER },
    select: { id: true },
  });
  cashier.id = user.id;

  const [assignedStore, otherStore] = await Promise.all([
    prisma.storeLocation.create({ data: { id: `${prefix}-assigned`, name: "Integration assigned store", address: "Addis Ababa", phone: "+251000000000", timezone: "Africa/Addis_Ababa", hours: {} } }),
    prisma.storeLocation.create({ data: { id: `${prefix}-other`, name: "Integration other store", address: "Addis Ababa", phone: "+251000000000", timezone: "Africa/Addis_Ababa", hours: {} } }),
  ]);
  await prisma.staffStoreAssignment.create({ data: { userId: cashier.id, storeId: assignedStore.id } });
  const category = await prisma.category.create({ data: { name: "Integration staff detail", slug: prefix } });
  const product = await prisma.product.create({ data: { name: `${prefix} product`, price: new Prisma.Decimal("55"), categoryId: category.id } });

  const [assignedOrder, otherStoreOrder] = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: `${prefix}-assigned`,
        storeId: assignedStore.id,
        totalAmount: new Prisma.Decimal("55"),
        subtotalAmount: new Prisma.Decimal("47.83"),
        taxAmount: new Prisma.Decimal("7.17"),
        items: { create: { productId: product.id, quantity: 1, price: new Prisma.Decimal("55") } },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: `${prefix}-other`,
        storeId: otherStore.id,
        totalAmount: new Prisma.Decimal("55"),
        items: { create: { productId: product.id, quantity: 1, price: new Prisma.Decimal("55") } },
      },
    }),
  ]);
  assignedOrderId = assignedOrder.id;
  otherStoreOrderId = otherStoreOrder.id;
  await prisma.auditLog.create({ data: { userId: cashier.id, userRole: UserRole.CASHIER, action: "update", resource: "orders", resourceId: assignedOrder.id } });
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { user: { email: cashier.email } } });
  await prisma.orderItem.deleteMany({ where: { order: { orderNumber: { startsWith: prefix } } } });
  await prisma.order.deleteMany({ where: { orderNumber: { startsWith: prefix } } });
  await prisma.staffStoreAssignment.deleteMany({ where: { user: { email: cashier.email } } });
  await prisma.product.deleteMany({ where: { name: `${prefix} product` } });
  await prisma.category.deleteMany({ where: { slug: prefix } });
  await prisma.storeLocation.deleteMany({ where: { id: { startsWith: prefix } } });
  await prisma.$disconnect();
});

describe("staff order detail service", () => {
  it("returns an assigned-store order and its operational audit trail only", async () => {
    const result = await getStaffOrderAudit(cashier, assignedOrderId);

    expect(result?.order.id).toBe(assignedOrderId);
    expect(result?.order.items).toHaveLength(1);
    expect(result?.audit).toEqual([expect.objectContaining({ action: "update", userRole: UserRole.CASHIER })]);
    expect(await getStaffOrderAudit(cashier, otherStoreOrderId)).toBeNull();
  });
});
