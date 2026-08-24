import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "@/app/generated/prisma/client";
import { UserRole } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { CatalogueConflictError, createAdminCategory, createAdminProduct, setAdminCategoryActive } from "@/lib/admin/catalogue-service";

const actor = { id: "", email: "integration-admin@k-coffee.test", name: "Integration Admin", role: UserRole.ADMIN };

async function removeFixtures() {
  await prisma.auditLog.deleteMany({ where: { user: { email: actor.email } } });
  // Clean by the fixture category rather than product name. This also removes
  // incomplete fixture products left by a failed/interrupted earlier run.
  await prisma.product.deleteMany({ where: { category: { slug: { startsWith: "integration-" } } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: "integration-" } } });
}

beforeEach(async () => {
  await removeFixtures();
  const user = await prisma.user.upsert({
    where: { email: actor.email },
    update: { role: UserRole.ADMIN },
    create: { id: randomUUID(), email: actor.email, name: actor.name, role: UserRole.ADMIN },
    select: { id: true },
  });
  actor.id = user.id;
});

afterAll(async () => {
  await removeFixtures();
  await prisma.$disconnect();
});

describe("catalogue lifecycle services", () => {
  it("records category and product changes and blocks archiving active product categories", async () => {
    const category = await createAdminCategory(actor, { name: "Integration Coffee", slug: "integration-coffee" });
    const product = await createAdminProduct(actor, { name: "Integration Latte", description: null, categoryId: category.id, imageUrl: null, isActive: true, price: new Prisma.Decimal("85.50") });

    await expect(setAdminCategoryActive(actor, category.id, false)).rejects.toBeInstanceOf(CatalogueConflictError);
    await prisma.product.update({ where: { id: product.id }, data: { isActive: false } });
    const archived = await setAdminCategoryActive(actor, category.id, false);
    expect(archived.isActive).toBe(false);

    const audits = await prisma.auditLog.findMany({ where: { userId: actor.id, resource: { in: ["categories", "products"] } }, select: { action: true, resource: true, resourceId: true } });
    expect(audits).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: "create", resource: "categories", resourceId: category.id }),
      expect.objectContaining({ action: "create", resource: "products", resourceId: product.id }),
      expect.objectContaining({ action: "archive", resource: "categories", resourceId: category.id }),
    ]));
  });

  it("rejects creating a product in an archived category", async () => {
    const category = await createAdminCategory(actor, { name: "Integration Archive", slug: "integration-archive" });
    await setAdminCategoryActive(actor, category.id, false);
    await expect(createAdminProduct(actor, { name: "Integration Blocked", description: null, categoryId: category.id, imageUrl: null, isActive: true, price: new Prisma.Decimal("45") })).rejects.toBeInstanceOf(CatalogueConflictError);
  });
});
