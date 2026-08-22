import {
  AuthenticationError,
  AuthorizationError,
  requireActor,
} from "@/lib/authz";
import { cancelCustomerOrder } from "@/lib/orders/customer-service";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const actor = await requireActor();
    const { orderId } = await params;
    return Response.json(await cancelCustomerOrder(actor, orderId));
  } catch (error) {
    if (error instanceof AuthenticationError)
      return Response.json({ error: error.message }, { status: 401 });
    if (error instanceof AuthorizationError)
      return Response.json(
        { error: "This order can no longer be cancelled." },
        { status: 403 },
      );
    return Response.json(
      { error: "Unable to cancel this order." },
      { status: 500 },
    );
  }
}
