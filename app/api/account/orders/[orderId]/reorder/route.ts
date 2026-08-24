import { AuthenticationError, AuthorizationError, requireActor } from "@/lib/authz";
import { CustomerOrderHistoryFilterError, parseCustomerOrderId } from "@/lib/orders/customer-order-validation";
import { getCustomerReorderPreview } from "@/lib/orders/customer-service";

export async function GET(_: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const actor = await requireActor();
    const { orderId } = await params;
    return Response.json(await getCustomerReorderPreview(actor, parseCustomerOrderId(orderId)));
  } catch (error) {
    if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError) return Response.json({ error: "This order is unavailable." }, { status: 404 });
    if (error instanceof CustomerOrderHistoryFilterError) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: "Unable to prepare this order again." }, { status: 500 });
  }
}
