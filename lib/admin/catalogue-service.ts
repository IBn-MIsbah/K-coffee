import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { type AuthenticatedActor } from "@/lib/authz";
import { logAudit } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { type CategoryInput, type ProductInput } from "./catalogue-validation";

export class CatalogueConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogueConflictError";
  }
}

export class CatalogueNotFoundError extends Error {
  constructor() {
    super("The requested catalogue record was not found.");
    this.name = "CatalogueNotFoundError";
  }
}

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { products: true } },
} satisfies Prisma.CategorySelect;

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  isActive: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true, isActive: true } },
} satisfies Prisma.ProductSelect;

async function activeCategoryOrThrow(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, isActive: true },
  });
  if (!category) throw new CatalogueNotFoundError();
  if (!category.isActive)
    throw new CatalogueConflictError(
      "Choose an active category before saving this product.",
    );
}

export function listAdminCategories() {
  return prisma.category.findMany({
    select: categorySelect,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export function getAdminCategory(id: string) {
  return prisma.category.findUnique({ where: { id }, select: categorySelect });
}

export async function createAdminCategory(
  actor: AuthenticatedActor,
  input: CategoryInput,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: input,
        select: categorySelect,
      });
      await tx.auditLog.create({
        data: {
          userId: actor.id,
          userRole: actor.role,
          action: "create",
          resource: "categories",
          resourceId: category.id,
          details: { name: category.name, slug: category.slug },
        },
      });
      return category;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      throw new CatalogueConflictError(
        "That category name or slug already exists.",
      );
    throw error;
  }
}

export async function updateAdminCategory(
  actor: AuthenticatedActor,
  id: string,
  input: CategoryInput,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const category = await tx.category.update({
        where: { id },
        data: input,
        select: categorySelect,
      });
      await tx.auditLog.create({
        data: {
          userId: actor.id,
          userRole: actor.role,
          action: "update",
          resource: "categories",
          resourceId: id,
          details: input,
        },
      });
      return category;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      throw new CatalogueConflictError(
        "That category name or slug already exists.",
      );
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      throw new CatalogueNotFoundError();
    throw error;
  }
}

export async function setAdminCategoryActive(
  actor: AuthenticatedActor,
  id: string,
  isActive: boolean,
) {
  const category = await getAdminCategory(id);
  if (!category) throw new CatalogueNotFoundError();
  if (!isActive) {
    const activeProducts = await prisma.product.count({
      where: { categoryId: id, isActive: true },
    });
    if (activeProducts)
      throw new CatalogueConflictError(
        "Archive or move all active products in this category first.",
      );
  }
  const updated = await prisma.category.update({
    where: { id },
    data: { isActive },
    select: categorySelect,
  });
  await logAudit(
    actor.id,
    actor.role,
    isActive ? "restore" : "archive",
    "categories",
    { categoryId: id, name: updated.name },
    id,
  );
  return updated;
}

export function listAdminProducts() {
  return prisma.product.findMany({
    select: productSelect,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export function getAdminProduct(id: string) {
  return prisma.product.findUnique({ where: { id }, select: productSelect });
}

export async function createAdminProduct(
  actor: AuthenticatedActor,
  input: ProductInput,
) {
  await activeCategoryOrThrow(input.categoryId);
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: input,
      select: productSelect,
    });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        userRole: actor.role,
        action: "create",
        resource: "products",
        resourceId: product.id,
        details: {
          name: product.name,
          categoryId: input.categoryId,
          price: input.price.toString(),
        },
      },
    });
    return product;
  });
}

export async function updateAdminProduct(
  actor: AuthenticatedActor,
  id: string,
  input: ProductInput,
) {
  await activeCategoryOrThrow(input.categoryId);
  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: input,
        select: productSelect,
      });
      await tx.auditLog.create({
        data: {
          userId: actor.id,
          userRole: actor.role,
          action: "update",
          resource: "products",
          resourceId: id,
          details: {
            name: product.name,
            categoryId: input.categoryId,
            price: input.price.toString(),
            isActive: input.isActive,
          },
        },
      });
      return product;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      throw new CatalogueNotFoundError();
    throw error;
  }
}

export async function setAdminProductActive(
  actor: AuthenticatedActor,
  id: string,
  isActive: boolean,
) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { isActive },
      select: productSelect,
    });
    await logAudit(
      actor.id,
      actor.role,
      isActive ? "restore" : "archive",
      "products",
      { productId: id, name: product.name },
      id,
    );
    return product;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      throw new CatalogueNotFoundError();
    throw error;
  }
}
