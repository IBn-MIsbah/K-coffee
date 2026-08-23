import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "@/app/generated/prisma/client";
import { getCustomerOrder, listCustomerOrders } from "@/lib/orders/customer-service";
import { parseCustomerOrderHistoryFilters } from "@/lib/orders/customer-order-validation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

const prefix = "integration-customer-orders";
const firstCustomer = { id: "", email: `${prefix}-first@k-coffee.test`, name: "First customer", role: UserRole.USER };
const secondCustomer = { id: "", email: `${prefix}-second@k-coffee.test`, name: "Second customer", role: UserRole.USER };
let firstOrderId = "";
let secondOrderId = "";

async function removeFixtures() {
  await prisma.orderItem.deleteMany({ where: { order: { orderNumber: { startsWith: prefix } } } });
  await prisma.order.deleteMany({ where: { orderNumber: { startsWith: prefix } } });
  await prisma.storeLocation.deleteMany({ where: { id: `${prefix}-store` } });
}

beforeEach(async () => {
  await removeFixtures();
  const [first, second] = await Promise.all([firstCustomer, secondCustomer].map((customer) => prisma.user.upsert({
    where: { email: customer.email },
    update: { role: UserRole.USER },
    create: { id: randomUUID(), email: customer.email, name: customer.name, role: UserRole.USER },
    select: { id: true },
  })));
  firstCustomer.id = first.id;
  secondCustomer.id = second.id;
  const store = await prisma.storeLocation.create({ data: { id: `${prefix}-store`, name: "Integration customer store", address: "Addis Ababa", phone: "+251000000000", timezone: "Africa/Addis_Ababa", hours: {} } });
  const [firstOrder, secondOrder] = await Promise.all([
    prisma.order.create({ data: { orderNumber: `${prefix}-pending`, userId: firstCustomer.id, storeId: store.id, totalAmount: new Prisma.Decimal("15") } }),
    prisma.order.create({ data: { orderNumber: `${prefix}-completed`, userId: secondCustomer.id, storeId: store.id, totalAmount: new Prisma.Decimal("20"), status: "COMPLETED" } }),
  ]);
  firstOrderId = firstOrder.id;
  secondOrderId = secondOrder.id;
});

afterAll(async () => {
  await removeFixtures();
  await prisma.$disconnect();
});

describe("customer order ownership", () => {
  it("returns only the actor's active orders and safely hides another customer's order", async () => {
    const activeOrders = await listCustomerOrders(firstCustomer, parseCustomerOrderHistoryFilters({}));

    expect(activeOrders.map((order) => order.id)).toEqual([firstOrderId]);
    expect((await getCustomerOrder(firstCustomer, firstOrderId))?.id).toBe(firstOrderId);
    expect(await getCustomerOrder(firstCustomer, secondOrderId)).toBeNull();
  });
});
