export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutClient from "./checkout-client";

export default async function CheckoutPage() {
  const stores = await prisma.storeLocation.findMany({
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
  });
  if (!stores.length) redirect("/cart");
  return <CheckoutClient stores={stores} />;
}
