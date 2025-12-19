import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = session?.user.role;

  if (role === "ADMIN" || role === "SUPERADMIN") redirect("/dashboard/admin");
  if (role === "CASHIER") redirect("/dashboard/cashier");
  redirect("/dashboard/user");
}
