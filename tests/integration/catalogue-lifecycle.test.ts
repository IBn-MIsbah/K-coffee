import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "@/app/generated/prisma/client";
import { UserRole } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { CatalogueConflictError, createAdminCategory, createAdminProduct, setAdminCategoryActive } from "@/lib/admin/catalogue-service";

const actor = { id: "", email: "integration-admin@k-coffee.test", name: "Integration Admin", role: UserRole.ADMIN };
const prefix = "integration-catalogue";

async function removeFixtures() {
  await prisma.auditLog.deleteMany({ where: { user: { email: actor.email } } });
  // Restrict cleanup to this file's fixtures. Integration files run in
  // parallel, so a shared `integration-*` prefix can delete another test's
  // category between its category and product inserts.
  await prisma.product.deleteMany({ where: { category: { slug: { startsWith: prefix } } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: prefix } } });
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
    const category = await createAdminCategory(actor, { name: "Integration Catalogue Coffee", slug: `${prefix}-coffee` });
    const product = await createAdminProduct(actor, { name: "Integration Catalogue Latte", description: null, categoryId: category.id, imageUrl: null, isActive: true, price: new Prisma.Decimal("85.50") });

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
    const category = await createAdminCategory(actor, { name: "Integration Catalogue Archive", slug: `${prefix}-archive` });
    await setAdminCategoryActive(actor, category.id, false);
    await expect(createAdminProduct(actor, { name: "Integration Catalogue Blocked", description: null, categoryId: category.id, imageUrl: null, isActive: true, price: new Prisma.Decimal("45") })).rejects.toBeInstanceOf(CatalogueConflictError);
  });
});
