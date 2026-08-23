import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { CatalogueConflictError, createAdminCategory, listAdminCategories } from "@/lib/admin/catalogue-service";
import { CatalogueValidationError, parseCategoryInput } from "@/lib/admin/catalogue-validation";

function errorResponse(error: unknown) {
  if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
  if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
  if (error instanceof CatalogueValidationError) return Response.json({ error: error.message }, { status: 422 });
  if (error instanceof CatalogueConflictError) return Response.json({ error: error.message }, { status: 409 });
  return Response.json({ error: "Unable to manage categories." }, { status: 500 });
}

export async function GET() {
  try {
    await requirePermission({ action: "manage", resource: "categories" });
    return Response.json({ categories: await listAdminCategories() });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "categories" });
    return Response.json({ category: await createAdminCategory(actor, parseCategoryInput(await request.json())) }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
