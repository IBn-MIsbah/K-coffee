export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { getCurrentActor } from "@/lib/authz";
import { getDefaultStoreId } from "@/lib/account/profile-validation";
import { UserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import CheckoutClient from "./checkout-client";

export default async function CheckoutPage() {
  const actor = await getCurrentActor();
  if (!actor) redirect("/login?callbackUrl=%2Fcheckout");
  if (actor.role === UserRole.CASHIER) redirect("/pos");
  if (actor.role === UserRole.ADMIN || actor.role === UserRole.SUPERADMIN) {
    redirect("/admin/dashboard");
  }
  if (actor.role !== UserRole.USER) redirect("/unauthorized");

  const [stores, customer] = await Promise.all([prisma.storeLocation.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      address: true,
      timezone: true,
      pickupIntervalMinutes: true,
      pickupLeadTimeMinutes: true,
    },
    orderBy: { name: "asc" },
  }), prisma.user.findUnique({ where: { id: actor.id }, select: { preferences: true } })]);
  if (!stores.length) redirect("/cart");
  const defaultStoreId = getDefaultStoreId(customer?.preferences);
  return <CheckoutClient stores={stores} defaultStoreId={stores.some((store) => store.id === defaultStoreId) ? defaultStoreId : null} />;
}
