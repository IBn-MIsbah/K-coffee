import { createHash } from "node:crypto";
import { AuthenticationError, requireActor } from "@/lib/authz";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token || token.length < 32) return Response.json({ error: "This invitation link is invalid." }, { status: 422 });
  const invitation = await prisma.staffInvitation.findUnique({ where: { tokenHash: createHash("sha256").update(token).digest("hex") }, select: { email: true, role: true, expiresAt: true, acceptedAt: true } });
  if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) return Response.json({ error: "This invitation link has expired or was already used." }, { status: 404 });
  return Response.json({ email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt });
}

export async function POST(request: Request) {
  try {
    const actor = await requireActor();
    const { token } = await request.json();
    if (typeof token !== "string" || token.length < 32) return Response.json({ error: "This invitation link is invalid." }, { status: 422 });
    const hash = createHash("sha256").update(token).digest("hex");
    const invitation = await prisma.$transaction(async (tx) => {
      const invite = await tx.staffInvitation.findUnique({ where: { tokenHash: hash } });
      if (!invite || invite.acceptedAt || invite.expiresAt <= new Date()) throw new Error("INVALID_INVITATION");
      if (!actor.email || actor.email.toLowerCase() !== invite.email.toLowerCase()) throw new Error("EMAIL_MISMATCH");
      await tx.user.update({ where: { id: actor.id }, data: { role: invite.role, isActive: true, deactivatedAt: null, deactivatedById: null } });
      await tx.staffInvitation.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
      await tx.auditLog.create({ data: { userId: actor.id, userRole: invite.role, action: "staff_invitation_accept", resource: "users", resourceId: actor.id, details: { invitationId: invite.id, role: invite.role } } });
      return invite;
    });
    return Response.json({ role: invitation.role });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof Error && error.message === "INVALID_INVITATION") return Response.json({ error: "This invitation link has expired or was already used." }, { status: 404 });
    if (error instanceof Error && error.message === "EMAIL_MISMATCH") return Response.json({ error: "Sign in with the email address that received this invitation." }, { status: 403 });
    console.error("Staff invitation acceptance failed", error);
    return Response.json({ error: "Unable to accept this invitation." }, { status: 500 });
  }
}
