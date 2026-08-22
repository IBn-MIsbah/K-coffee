import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/rbac";

export async function PATCH(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "products" });
    const { productId } = await params;
    const body = await request.json();
    if (typeof body.isActive !== "boolean") return Response.json({ error: "isActive must be a boolean." }, { status: 422 });
    const product = await prisma.product.update({ where: { id: productId }, data: { isActive: body.isActive }, select: { id: true, name: true, isActive: true } });
    await logAudit(actor.id, actor.role, product.isActive ? "restore" : "archive", "products", { productId: product.id, name: product.name });
    return Response.json({ product });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    return Response.json({ error: "Unable to update the product." }, { status: 500 });
  }
}
