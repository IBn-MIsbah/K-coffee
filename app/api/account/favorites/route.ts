import { AuthenticationError, AuthorizationError, requireActor } from "@/lib/authz";
import { addCustomerFavorite, listCustomerFavoriteIds } from "@/lib/favorites/favorite-service";
import { FavoriteValidationError, parseFavoriteProductId } from "@/lib/favorites/favorite-validation";

export async function GET() {
  try {
    return Response.json({ productIds: await listCustomerFavoriteIds(await requireActor()) });
  } catch (error) {
    return favoriteErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const productId = parseFavoriteProductId(typeof body === "object" && body ? (body as { productId?: unknown }).productId : undefined);
    return Response.json(await addCustomerFavorite(await requireActor(), productId), { status: 201 });
  } catch (error) {
    return favoriteErrorResponse(error);
  }
}

function favoriteErrorResponse(error: unknown) {
  if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
  if (error instanceof AuthorizationError) return Response.json({ error: "This product cannot be saved." }, { status: 403 });
  if (error instanceof FavoriteValidationError) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ error: "Unable to update saved items." }, { status: 500 });
}
