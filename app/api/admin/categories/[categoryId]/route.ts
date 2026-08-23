import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { CatalogueConflictError, CatalogueNotFoundError, getAdminCategory, updateAdminCategory } from "@/lib/admin/catalogue-service";
import { CatalogueValidationError, parseCategoryInput } from "@/lib/admin/catalogue-validation";

function errorResponse(error: unknown) {
  if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
  if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
  if (error instanceof CatalogueNotFoundError) return Response.json({ error: error.message }, { status: 404 });
  if (error instanceof CatalogueValidationError) return Response.json({ error: error.message }, { status: 422 });
  if (error instanceof CatalogueConflictError) return Response.json({ error: error.message }, { status: 409 });
  return Response.json({ error: "Unable to manage this category." }, { status: 500 });
}

export async function GET(_: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    await requirePermission({ action: "manage", resource: "categories" });
    const category = await getAdminCategory((await params).categoryId);
    if (!category) throw new CatalogueNotFoundError();
    return Response.json({ category });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "categories" });
    return Response.json({ category: await updateAdminCategory(actor, (await params).categoryId, parseCategoryInput(await request.json())) });
  } catch (error) { return errorResponse(error); }
}
