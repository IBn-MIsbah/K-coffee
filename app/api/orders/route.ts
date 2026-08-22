import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { CheckoutValidationError, createPickupOrder } from "@/lib/orders/create-pickup-order";

export async function POST(request: Request) {
  try {
    const actor = await requirePermission({ action: "create", resource: "orders" });
    const body = await request.json();
    const order = await createPickupOrder(actor, body);
    return Response.json({ order }, { status: order.reused ? 200 : 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 });
    if (error instanceof CheckoutValidationError) return Response.json({ error: error.message }, { status: 422 });
    console.error("Order creation failed", error);
    return Response.json({ error: "We could not create your order. Please try again." }, { status: 500 });
  }
}
