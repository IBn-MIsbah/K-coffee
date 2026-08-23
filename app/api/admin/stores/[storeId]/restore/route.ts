import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { setAdminStoreActive } from "@/lib/admin/store-service";

export async function POST(_request: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "stores" });
    const store = await setAdminStoreActive(actor, (await params).storeId, true);
    return store ? Response.json({ store }) : Response.json({ error: "Store not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    return Response.json({ error: "Unable to restore the store." }, { status: 500 });
  }
}
