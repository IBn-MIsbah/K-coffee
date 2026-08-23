import { requirePageRole } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function AdminDashboardAliasPage() {
  await requirePageRole([UserRole.ADMIN, UserRole.SUPERADMIN], "/admin/dashboard");
  redirect("/dashboard/admin");
}
