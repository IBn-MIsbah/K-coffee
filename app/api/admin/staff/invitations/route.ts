import { createHash, randomBytes } from "node:crypto";
import { AuthenticationError, AuthorizationError, requireRole } from "@/lib/authz";
import { sendAuthEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";
import { z } from "zod";

const schema = z.object({ email: z.string().trim().email("Enter a valid staff email address.").max(320), role: z.enum([UserRole.CASHIER, UserRole.ADMIN]) });

export async function POST(request: Request) {
  try {
    const actor = await requireRole([UserRole.SUPERADMIN]);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "The invitation is invalid." }, { status: 422 });
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return Response.json({ error: "An account already uses this email address." }, { status: 409 });
    const token = randomBytes(32).toString("base64url");
    const invitation = await prisma.staffInvitation.create({ data: { email, role: parsed.data.role, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdById: actor.id } });
    const origin = process.env.BETTER_AUTH_URL;
    if (!origin) throw new Error("INVITE_URL_MISSING");
    await sendAuthEmail({ to: email, subject: "You are invited to K-Coffee staff access", text: `A K-Coffee superadmin invited you as ${parsed.data.role.replaceAll("_", " ")}. Set up your account within seven days:\n\n${origin}/staff/accept?token=${token}\n\nDo not forward this link.` });
    await prisma.auditLog.create({ data: { userId: actor.id, userRole: actor.role, action: "staff_invite", resource: "users", resourceId: invitation.id, details: { email, role: invitation.role, expiresAt: invitation.expiresAt.toISOString() } } });
    return Response.json({ invitation: { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt } }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    console.error("Staff invitation failed", error);
    return Response.json({ error: "Unable to send the staff invitation." }, { status: 500 });
  }
}
