import { AuthenticationError, requireActor } from "@/lib/authz";
import prisma from "@/lib/prisma";
export async function PATCH(request: Request) {
  try {
    const actor = await requireActor();
    const { name, phone } = await request.json();
    if (
      typeof name !== "string" ||
      typeof phone !== "string" ||
      name.trim().length < 2 ||
      name.length > 80 ||
      phone.length > 30
    )
      return Response.json(
        { error: "Enter a name and valid phone number." },
        { status: 422 },
      );
    const user = await prisma.user.update({
      where: { id: actor.id },
      data: { name: name.trim(), phone: phone.trim() || null },
      select: { name: true, phone: true },
    });
    return Response.json({ user });
  } catch (error) {
    if (error instanceof AuthenticationError)
      return Response.json({ error: error.message }, { status: 401 });
    return Response.json({ error: "Unable to save profile." }, { status: 500 });
  }
}
