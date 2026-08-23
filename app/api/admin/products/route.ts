import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { CatalogueConflictError, CatalogueNotFoundError, createAdminProduct, listAdminProducts } from "@/lib/admin/catalogue-service";
import { CatalogueValidationError, parseProductInput } from "@/lib/admin/catalogue-validation";

function errorResponse(error: unknown) {
  if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
  if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
  if (error instanceof CatalogueNotFoundError) return Response.json({ error: error.message }, { status: 404 });
  if (error instanceof CatalogueValidationError || error instanceof CatalogueConflictError) return Response.json({ error: error.message }, { status: 422 });
  return Response.json({ error: "Unable to manage products." }, { status: 500 });
}

export async function GET() {
  try {
    await requirePermission({ action: "manage", resource: "products" });
    return Response.json({ products: await listAdminProducts() });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "products" });
    return Response.json({ product: await createAdminProduct(actor, parseProductInput(await request.json())) }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
