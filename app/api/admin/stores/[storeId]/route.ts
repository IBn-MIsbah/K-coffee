import { Prisma } from "@/app/generated/prisma/client";
import { getAdminStore, updateAdminStore } from "@/lib/admin/store-service";
import { StoreValidationError } from "@/lib/admin/store-validation";
import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";

function responseFor(error: unknown) {
  if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
  if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
  if (error instanceof StoreValidationError) return Response.json({ error: error.message }, { status: 422 });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return Response.json({ error: "Store not found." }, { status: 404 });
  return Response.json({ error: "Unable to process the store request." }, { status: 500 });
}

export async function GET(_request: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    await requirePermission({ action: "manage", resource: "stores" });
    const store = await getAdminStore((await params).storeId);
    return store ? Response.json({ store }) : Response.json({ error: "Store not found." }, { status: 404 });
  } catch (error) {
    return responseFor(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const actor = await requirePermission({ action: "manage", resource: "stores" });
    const store = await updateAdminStore(actor, (await params).storeId, await request.json());
    return Response.json({ store });
  } catch (error) {
    return responseFor(error);
  }
}
