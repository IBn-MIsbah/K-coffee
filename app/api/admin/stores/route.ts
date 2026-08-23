import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { createAdminStore, listAdminStores } from "@/lib/admin/store-service";
import { StoreValidationError } from "@/lib/admin/store-validation";

function responseFor(error: unknown) {
  if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
  if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
  if (error instanceof StoreValidationError) return Response.json({ error: error.message }, { status: 422 });
  return Response.json({ error: "Unable to process the store request." }, { status: 500 });
}

export async function GET() {
  try {
    await requirePermission({ action: "manage", resource: "stores" });
    return Response.json({ stores: await listAdminStores() });
  } catch (error) {
    return responseFor(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "stores" });
    const store = await createAdminStore(actor, await request.json());
    return Response.json({ store }, { status: 201 });
  } catch (error) {
    return responseFor(error);
  }
}
