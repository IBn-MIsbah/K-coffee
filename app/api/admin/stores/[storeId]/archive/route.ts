import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { setAdminStoreActive, StoreArchiveConflictError } from "@/lib/admin/store-service";

export async function POST(_request: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "stores" });
    const store = await setAdminStoreActive(actor, (await params).storeId, false);
    return store ? Response.json({ store }) : Response.json({ error: "Store not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    if (error instanceof StoreArchiveConflictError) return Response.json({ error: error.message }, { status: 409 });
    return Response.json({ error: "Unable to archive the store." }, { status: 500 });
  }
}
