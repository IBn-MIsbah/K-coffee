import { requirePageRole } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function PosPage() {
  await requirePageRole([UserRole.CASHIER], "/pos");
  redirect("/dashboard/cashier");
}
