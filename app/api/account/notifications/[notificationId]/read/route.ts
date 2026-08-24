import {
  AuthenticationError,
  AuthorizationError,
  requireRole,
} from "@/lib/authz";
import { markCustomerNotificationRead } from "@/lib/notifications/customer-notification-service";
import { notificationIdSchema } from "@/lib/notifications/notification-validation";
import { UserRole } from "@/lib/rbac";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  try {
    const actor = await requireRole([UserRole.USER]);
    const { notificationId } = await params;
    const parsed = notificationIdSchema.safeParse(notificationId);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message }, { status: 422 });
    }

    const marked = await markCustomerNotificationRead(actor, parsed.data);
    return Response.json({ marked });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof AuthorizationError) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    return Response.json({ error: "Unable to update this notification." }, { status: 500 });
  }
}
