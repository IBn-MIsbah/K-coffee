import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { IllegalOrderTransitionError, transitionStaffOrder } from "@/lib/orders/staff-service";
import { OrderTransitionValidationError, parseStaffOrderTransition } from "@/lib/orders/order-validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try { const actor = await requirePermission({ action: "process", resource: "orders" }); const { orderId } = await params; const { nextStatus } = parseStaffOrderTransition(await request.json()); return Response.json(await transitionStaffOrder(actor, orderId, nextStatus)); }
  catch (error) { if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 }); if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 }); if (error instanceof OrderTransitionValidationError || error instanceof IllegalOrderTransitionError) return Response.json({ error: error.message }, { status: 422 }); console.error(error); return Response.json({ error: "Unable to update this order." }, { status: 500 }); }
}
