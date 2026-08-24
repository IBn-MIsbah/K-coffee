import "server-only";

import { type AuthenticatedActor, AuthorizationError } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

const favoriteProductSelect = {
  id: true,
  name: true,
  price: true,
  imageUrl: true,
  description: true,
} as const;

function requireCustomer(actor: AuthenticatedActor) {
  if (actor.role !== UserRole.USER) throw new AuthorizationError();
}

export async function listCustomerFavoriteProducts(actor: AuthenticatedActor) {
  requireCustomer(actor);
  return prisma.favoriteProduct.findMany({
    where: { userId: actor.id, product: { isActive: true, category: { isActive: true } } },
    orderBy: { createdAt: "desc" },
    select: { product: { select: favoriteProductSelect } },
  });
}

export async function listCustomerFavoriteIds(actor: AuthenticatedActor) {
  requireCustomer(actor);
  const favorites = await prisma.favoriteProduct.findMany({ where: { userId: actor.id }, select: { productId: true } });
  return favorites.map((favorite) => favorite.productId);
}

export async function addCustomerFavorite(actor: AuthenticatedActor, productId: string) {
  requireCustomer(actor);
  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true, category: { isActive: true } }, select: { id: true } });
  if (!product) throw new AuthorizationError();
  return prisma.favoriteProduct.upsert({
    where: { userId_productId: { userId: actor.id, productId: product.id } },
    update: {},
    create: { userId: actor.id, productId: product.id },
    select: { productId: true },
  });
}

export async function removeCustomerFavorite(actor: AuthenticatedActor, productId: string) {
  requireCustomer(actor);
  await prisma.favoriteProduct.deleteMany({ where: { userId: actor.id, productId } });
}
