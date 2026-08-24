import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  type MenuFilters,
  type MenuSort,
  type PublicMenuCatalogue,
  menuSortOptions,
} from "./catalogue-types";

const PAGE_SIZE = 12;
const productIdSchema = z.string().trim().min(1).max(191);

const queryValueSchema = z.union([z.string(), z.array(z.string())]).optional();

const menuFiltersSchema = z.object({
  category: queryValueSchema.transform((value) => (Array.isArray(value) ? value[0] : value)),
  q: queryValueSchema.transform((value) => (Array.isArray(value) ? value[0] : value)),
  sort: queryValueSchema.transform((value) => (Array.isArray(value) ? value[0] : value)),
  page: queryValueSchema.transform((value) => (Array.isArray(value) ? value[0] : value)),
});

function optionalText(value: string | undefined, maximum: number) {
  const text = value?.trim();
  return text && text.length <= maximum ? text : undefined;
}

function parsePage(value: string | undefined) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 && page <= 10_000 ? page : 1;
}

function parseSort(value: string | undefined): MenuSort {
  return menuSortOptions.includes(value as MenuSort) ? (value as MenuSort) : "latest";
}

export function parseMenuFilters(input: Record<string, string | string[] | undefined>): MenuFilters {
  const parsed = menuFiltersSchema.parse(input);

  return {
    category: optionalText(parsed.category, 80)?.toLowerCase(),
    q: optionalText(parsed.q, 80),
    sort: parseSort(parsed.sort),
    page: parsePage(parsed.page),
  };
}

export function parseMenuProductId(value: string) {
  const result = productIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

function productOrderBy(sort: MenuSort): Prisma.ProductOrderByWithRelationInput {
  if (sort === "price-asc") return { price: "asc" };
  if (sort === "price-desc") return { price: "desc" };
  return { createdAt: "desc" };
}

export async function getPublicMenuCatalogue(filters: MenuFilters): Promise<PublicMenuCatalogue> {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    category: {
      isActive: true,
      ...(filters.category ? { slug: filters.category } : {}),
    },
  };

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const normalizedFilters =
    filters.page > totalPages ? { ...filters, page: totalPages } : filters;
  const products = await prisma.product.findMany({
    where,
    orderBy: productOrderBy(normalizedFilters.sort),
    skip: (normalizedFilters.page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  return {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category._count.products,
    })),
    products: products.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
    total,
    pageSize: PAGE_SIZE,
    filters: normalizedFilters,
  };
}

export async function getPublicMenuProduct(productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true, category: { isActive: true } },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!product) return null;

  return { ...product, price: Number(product.price) };
}

export async function getRelatedPublicMenuProducts(categoryId: string, productId: string) {
  const products = await prisma.product.findMany({
    where: {
      id: { not: productId },
      isActive: true,
      categoryId,
      category: { isActive: true },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  return products.map((product) => ({ ...product, price: Number(product.price) }));
}
