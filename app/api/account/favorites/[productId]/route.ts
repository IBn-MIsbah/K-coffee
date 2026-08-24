import { AuthenticationError, AuthorizationError, requireActor } from "@/lib/authz";
import { removeCustomerFavorite } from "@/lib/favorites/favorite-service";
import { FavoriteValidationError, parseFavoriteProductId } from "@/lib/favorites/favorite-validation";

export async function DELETE(_: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    await removeCustomerFavorite(await requireActor(), parseFavoriteProductId(productId));
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: "Saved items are unavailable for this account." }, { status: 403 });
    if (error instanceof FavoriteValidationError) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: "Unable to update saved items." }, { status: 500 });
  }
}
