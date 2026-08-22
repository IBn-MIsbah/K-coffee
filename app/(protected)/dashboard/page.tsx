import { requirePageSession } from "@/lib/authz";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const { role } = await requirePageSession("/dashboard");

  if (role === "ADMIN" || role === "SUPERADMIN") redirect("/dashboard/admin");
  if (role === "CASHIER") redirect("/dashboard/cashier");
  if (role === "USER") redirect("/dashboard/user");
  redirect("/unauthorized");
}
