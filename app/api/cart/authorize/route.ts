import { AuthenticationError, AuthorizationError, requireRole } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";

export async function POST() {
  try {
    await requireRole([UserRole.USER]);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof AuthorizationError) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    return Response.json({ error: "Unable to authorize cart access." }, { status: 500 });
  }
}
