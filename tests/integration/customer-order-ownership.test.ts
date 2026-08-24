import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "@/app/generated/prisma/client";
import { getCustomerOrder, getCustomerReorderPreview, listCustomerOrders } from "@/lib/orders/customer-service";
import { addCustomerFavorite, listCustomerFavoriteIds, listCustomerFavoriteProducts, removeCustomerFavorite } from "@/lib/favorites/favorite-service";
import { parseCustomerOrderHistoryFilters } from "@/lib/orders/customer-order-validation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

const prefix = "integration-customer-orders";
const firstCustomer = { id: "", email: `${prefix}-first@k-coffee.test`, name: "First customer", role: UserRole.USER };
const secondCustomer = { id: "", email: `${prefix}-second@k-coffee.test`, name: "Second customer", role: UserRole.USER };
let firstOrderId = "";
let firstCompletedOrderId = "";
let secondOrderId = "";
let productId = "";

async function removeFixtures() {
  await prisma.orderItem.deleteMany({ where: { order: { orderNumber: { startsWith: prefix } } } });
  await prisma.order.deleteMany({ where: { orderNumber: { startsWith: prefix } } });
  await prisma.product.deleteMany({ where: { name: `${prefix}-product` } });
  await prisma.category.deleteMany({ where: { slug: `${prefix}-category` } });
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
  const category = await prisma.category.create({ data: { name: `${prefix} category`, slug: `${prefix}-category` } });
  const product = await prisma.product.create({ data: { name: `${prefix}-product`, price: new Prisma.Decimal("15"), categoryId: category.id } });
  productId = product.id;
  const [firstOrder, firstCompletedOrder, secondOrder] = await Promise.all([
    prisma.order.create({ data: { orderNumber: `${prefix}-pending`, userId: firstCustomer.id, storeId: store.id, totalAmount: new Prisma.Decimal("15"), items: { create: { productId: product.id, quantity: 1, price: new Prisma.Decimal("15") } } } }),
    prisma.order.create({ data: { orderNumber: `${prefix}-first-completed`, userId: firstCustomer.id, storeId: store.id, totalAmount: new Prisma.Decimal("30"), status: "COMPLETED", items: { create: { productId: product.id, quantity: 2, price: new Prisma.Decimal("15") } } } }),
    prisma.order.create({
      data: {
        orderNumber: `${prefix}-completed`,
        userId: secondCustomer.id,
        storeId: store.id,
        totalAmount: new Prisma.Decimal("20"),
        status: "COMPLETED",
        items: { create: { productId: product.id, quantity: 1, price: new Prisma.Decimal("15") } },
      },
    }),
  ]);
  firstOrderId = firstOrder.id;
  firstCompletedOrderId = firstCompletedOrder.id;
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

  it("builds a current-catalogue reorder preview only for the owner's completed order", async () => {
    await expect(getCustomerReorderPreview(firstCustomer, firstOrderId)).rejects.toThrow();
    await expect(getCustomerReorderPreview(firstCustomer, secondOrderId)).rejects.toThrow();

    await prisma.product.update({ where: { name: `${prefix}-product` }, data: { price: new Prisma.Decimal("18") } });
    await expect(getCustomerReorderPreview(firstCustomer, firstCompletedOrderId)).resolves.toEqual({
      available: [expect.objectContaining({ name: `${prefix}-product`, price: "18", quantity: 2 })],
      unavailable: [],
    });
  });

  it("keeps favourites private and hides products that are no longer orderable", async () => {
    await addCustomerFavorite(firstCustomer, productId);
    await expect(listCustomerFavoriteIds(firstCustomer)).resolves.toEqual([productId]);
    await expect(listCustomerFavoriteIds(secondCustomer)).resolves.toEqual([]);
    await expect(listCustomerFavoriteProducts(firstCustomer)).resolves.toEqual([
      expect.objectContaining({ product: expect.objectContaining({ id: productId }) }),
    ]);

    await prisma.product.update({ where: { id: productId }, data: { isActive: false } });
    await expect(listCustomerFavoriteProducts(firstCustomer)).resolves.toEqual([]);
    await removeCustomerFavorite(firstCustomer, productId);
    await expect(listCustomerFavoriteIds(firstCustomer)).resolves.toEqual([]);
  });
});
