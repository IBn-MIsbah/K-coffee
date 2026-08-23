import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { CatalogueConflictError, CatalogueNotFoundError, getAdminProduct, setAdminProductActive, updateAdminProduct } from "@/lib/admin/catalogue-service";
import { CatalogueValidationError, parseProductInput } from "@/lib/admin/catalogue-validation";

function errorResponse(error: unknown) {
  if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
  if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
  if (error instanceof CatalogueNotFoundError) return Response.json({ error: error.message }, { status: 404 });
  if (error instanceof CatalogueValidationError || error instanceof CatalogueConflictError) return Response.json({ error: error.message }, { status: 422 });
  return Response.json({ error: "Unable to manage this product." }, { status: 500 });
}

export async function GET(_: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await requirePermission({ action: "manage", resource: "products" });
    const product = await getAdminProduct((await params).productId);
    if (!product) throw new CatalogueNotFoundError();
    return Response.json({ product });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "products" });
    const productId = (await params).productId;
    const body: unknown = await request.json();
    const isLifecycleRequest = Boolean(body) && typeof body === "object" && !Array.isArray(body)
      && Object.keys(body as Record<string, unknown>).length === 1 && typeof (body as Record<string, unknown>).isActive === "boolean";
    const product = isLifecycleRequest
      ? await setAdminProductActive(actor, productId, (body as { isActive: boolean }).isActive)
      : await updateAdminProduct(actor, productId, parseProductInput(body));
    return Response.json({ product });
  } catch (error) { return errorResponse(error); }
}
