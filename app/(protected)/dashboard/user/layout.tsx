import { requirePageRole } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";

export default async function UserDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageRole([UserRole.USER], "/dashboard/user");
  return children;
}
