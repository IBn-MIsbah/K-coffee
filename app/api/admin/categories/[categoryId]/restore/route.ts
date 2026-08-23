import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { CatalogueNotFoundError, setAdminCategoryActive } from "@/lib/admin/catalogue-service";

export async function POST(_: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "categories" });
    return Response.json({ category: await setAdminCategoryActive(actor, (await params).categoryId, true) });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    if (error instanceof CatalogueNotFoundError) return Response.json({ error: error.message }, { status: 404 });
    return Response.json({ error: "Unable to restore this category." }, { status: 500 });
  }
}
