import { AuthenticationError, AuthorizationError, requirePermission } from "@/lib/authz";
import { transitionStaffOrder } from "@/lib/orders/staff-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try { const actor = await requirePermission({ action: "process", resource: "orders" }); const { orderId } = await params; const { nextStatus } = await request.json(); return Response.json(await transitionStaffOrder(actor, orderId, nextStatus)); }
  catch (error) { if (error instanceof AuthenticationError) return Response.json({ error: error.message }, { status: 401 }); if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: 403 }); console.error(error); return Response.json({ error: "Unable to update this order." }, { status: 500 }); }
}
