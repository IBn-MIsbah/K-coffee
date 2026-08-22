import { requirePageRole } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageRole([UserRole.ADMIN, UserRole.SUPERADMIN], "/dashboard/admin");
  return children;
}
