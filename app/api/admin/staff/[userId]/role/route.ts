import { AuthenticationError, AuthorizationError, requireRole } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const actor = await requireRole([UserRole.SUPERADMIN]);
    const { userId } = await params;
    const { role } = await request.json();
    if (!Object.values(UserRole).includes(role)) return Response.json({ error: "Invalid role." }, { status: 422 });
    const user = await prisma.$transaction(async (tx) => {
      const subject = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true, isActive: true } });
      if (!subject) throw new Error("NOT_FOUND");
      if (subject.role === UserRole.SUPERADMIN && role !== UserRole.SUPERADMIN) {
        const count = await tx.user.count({ where: { role: UserRole.SUPERADMIN, isActive: true } });
        if (count <= 1) throw new Error("LAST_SUPERADMIN");
      }
      const updated = await tx.user.update({ where: { id: userId }, data: { role }, select: { id: true, role: true } });
      await tx.auditLog.create({ data: { userId: actor.id, userRole: actor.role, action: "role_change", resource: "users", resourceId: userId, details: { before: subject.role, after: role } } });
      return updated;
    });
    return Response.json({ user });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    if (error instanceof Error && error.message === "LAST_SUPERADMIN") return Response.json({ error: "The final superadmin role cannot be removed." }, { status: 422 });
    if (error instanceof Error && error.message === "NOT_FOUND") return Response.json({ error: "User not found." }, { status: 404 });
    console.error("Role update failed", error);
    return Response.json({ error: "Unable to change role." }, { status: 500 });
  }
}
