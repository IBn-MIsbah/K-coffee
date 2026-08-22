import { requirePageRole } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";

export default async function CashierLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageRole([UserRole.CASHIER, UserRole.ADMIN, UserRole.SUPERADMIN], "/dashboard/cashier");
  return children;
}
