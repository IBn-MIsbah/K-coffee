import { requirePageRole } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";
import StaffDirectory from "./staff-directory";

export default async function StaffPage() {
  await requirePageRole([UserRole.SUPERADMIN], "/dashboard/admin/staff");
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, staffStores: { include: { store: { select: { name: true } } } }, permissionGrants: { where: { permission: "privacy:manage", revokedAt: null }, select: { id: true } } }, orderBy: [{ role: "asc" }, { name: "asc" }] });
  return <StaffDirectory users={users.map((user) => ({ id: user.id, name: user.name ?? user.email ?? "Unnamed user", role: user.role, stores: user.staffStores.map((assignment) => assignment.store.name), privacyManager: user.permissionGrants.length > 0 }))} />;
}
