import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { CatalogueNotFoundError, setAdminProductActive } from "@/lib/admin/catalogue-service";

export async function POST(_: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "products" });
    return Response.json({ product: await setAdminProductActive(actor, (await params).productId, true) });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    if (error instanceof CatalogueNotFoundError) return Response.json({ error: error.message }, { status: 404 });
    return Response.json({ error: "Unable to restore this product." }, { status: 500 });
  }
}
