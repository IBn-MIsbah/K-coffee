import { AuthenticationError, AuthorizationError, requireRole } from "@/lib/authz";
import { CheckoutValidationError, createPickupOrder } from "@/lib/orders/create-pickup-order";
import { UserRole } from "@/lib/rbac";

export async function POST(request: Request) {
  try {
    const actor = await requireRole([UserRole.USER]);
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
