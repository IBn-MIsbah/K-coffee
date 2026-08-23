import CartPage from "@/components/cart/CartPage";
import { getCurrentActor } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerCartPage() {
  const actor = await getCurrentActor();
  if (!actor) redirect("/login?callbackUrl=%2Fcart");
  if (actor.role === UserRole.USER) return <CartPage />;
  if (actor.role === UserRole.CASHIER) redirect("/pos");
  if (actor.role === UserRole.ADMIN || actor.role === UserRole.SUPERADMIN) {
    redirect("/admin/dashboard");
  }
  redirect("/unauthorized");
}
