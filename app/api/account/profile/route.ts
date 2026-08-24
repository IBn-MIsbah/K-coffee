import { AuthenticationError, AuthorizationError, requireActor } from "@/lib/authz";
import { ProfileValidationError, parseProfileUpdate } from "@/lib/account/profile-validation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";
import type { Prisma } from "@/app/generated/prisma/client";
export async function PATCH(request: Request) {
  try {
    const actor = await requireActor();
    const update = parseProfileUpdate(await request.json());
    const existing = await prisma.user.findUnique({ where: { id: actor.id }, select: { preferences: true } });
    if (!existing) throw new AuthorizationError();

    const preferences = existing.preferences && typeof existing.preferences === "object" && !Array.isArray(existing.preferences)
      ? { ...(existing.preferences as Record<string, unknown>) }
      : {};
    if ("defaultStoreId" in update) {
      if (actor.role !== UserRole.USER) throw new AuthorizationError();
      if (update.defaultStoreId) {
        const store = await prisma.storeLocation.findFirst({ where: { id: update.defaultStoreId, isActive: true }, select: { id: true } });
        if (!store) return Response.json({ error: "Choose an active pickup location." }, { status: 422 });
        preferences.defaultStoreId = store.id;
      } else {
        delete preferences.defaultStoreId;
      }
    }
    const user = await prisma.user.update({
      where: { id: actor.id },
      data: { name: update.name, phone: update.phone || null, preferences: preferences as Prisma.InputJsonValue },
      select: { name: true, phone: true, preferences: true },
    });
    return Response.json({ user });
  } catch (error) {
    if (error instanceof AuthenticationError)
      return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError)
      return Response.json({ error: error.message }, { status: 403 });
    if (error instanceof ProfileValidationError)
      return Response.json({ error: error.message }, { status: 422 });
    return Response.json({ error: "Unable to save profile." }, { status: 500 });
  }
}
