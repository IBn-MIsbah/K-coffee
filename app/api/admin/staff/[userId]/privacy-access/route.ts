import { AuthenticationError, AuthorizationError, requireRole } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { logAudit, PRIVACY_MANAGE_PERMISSION, UserRole } from "@/lib/rbac";
import { z } from "zod";

const inputSchema = z.object({ enabled: z.boolean() });

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const actor = await requireRole([UserRole.SUPERADMIN]);
    const input = inputSchema.parse(await request.json());
    const { userId } = await params;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || user.role !== UserRole.ADMIN) return Response.json({ error: "Privacy access can only be assigned to an admin account." }, { status: 422 });
    if (input.enabled) await prisma.userPermissionGrant.create({ data: { userId, permission: PRIVACY_MANAGE_PERMISSION, grantedById: actor.id } });
    else await prisma.userPermissionGrant.updateMany({ where: { userId, permission: PRIVACY_MANAGE_PERMISSION, revokedAt: null }, data: { revokedAt: new Date(), revokedById: actor.id } });
    await logAudit(actor.id, actor.role, input.enabled ? "grant" : "revoke", "privacy_access", { userId });
    return Response.json({ enabled: input.enabled });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    return Response.json({ error: "Unable to update privacy access." }, { status: 500 });
  }
}
