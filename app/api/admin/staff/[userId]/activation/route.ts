import { AuthenticationError, AuthorizationError, requireRole } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";
import { z } from "zod";

const inputSchema = z.object({ isActive: z.boolean() });

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const actor = await requireRole([UserRole.SUPERADMIN]);
    const { userId } = await params;
    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "isActive must be true or false." }, { status: 422 });

    const user = await prisma.$transaction(async (tx) => {
      const subject = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true, isActive: true } });
      if (!subject) throw new Error("NOT_FOUND");
      if (!parsed.data.isActive && subject.isActive && subject.role === UserRole.SUPERADMIN) {
        const activeSuperadmins = await tx.user.count({ where: { role: UserRole.SUPERADMIN, isActive: true } });
        if (activeSuperadmins <= 1) throw new Error("LAST_SUPERADMIN");
      }
      const updated = await tx.user.update({ where: { id: userId }, data: { isActive: parsed.data.isActive, deactivatedAt: parsed.data.isActive ? null : new Date(), deactivatedById: parsed.data.isActive ? null : actor.id }, select: { id: true, isActive: true } });
      await tx.auditLog.create({ data: { userId: actor.id, userRole: actor.role, action: parsed.data.isActive ? "staff_activate" : "staff_deactivate", resource: "users", resourceId: userId, details: { before: subject.isActive, after: parsed.data.isActive } } });
      return updated;
    });
    return Response.json({ user });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    if (error instanceof Error && error.message === "NOT_FOUND") return Response.json({ error: "User not found." }, { status: 404 });
    if (error instanceof Error && error.message === "LAST_SUPERADMIN") return Response.json({ error: "The final active superadmin cannot be deactivated." }, { status: 422 });
    console.error("Staff activation update failed", error);
    return Response.json({ error: "Unable to update staff activation." }, { status: 500 });
  }
}
