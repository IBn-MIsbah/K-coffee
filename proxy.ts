/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { hasPermission, logAudit, UserRole } from "./lib/rbac";

const routePermission: Record<
  string,
  {
    action: string;
    resource: string;
    businessLogic?: (
      req: NextRequest,
      userId: string
    ) => Promise<Record<string, any>>;
  }
> = {
  //Order routes
  "/orders": { action: "read", resource: "order" },
  "/orders/create": { action: "create", resource: "orders" },
  "/orders/[id]/cancel": {
    action: "cancel",
    resource: "orders",
    businessLogic: async (req, userId) => {
      const orderId = req.nextUrl.pathname.split("/")[2];
      // Fetch order details for business logic
      return { orderId, orderUserId: userId };
    },
  },

  //Admin routes
  "/admin": { action: "view_all", resource: "analytics" },
  "/admin/products": { action: "manage", resource: "products" },
  "/admin/users": { action: "read", resource: "users" },
  "/admin/orders": { action: "manage", resource: "orders" },

  // Cashier routes
  "/cashier": { action: "process", resource: "orders" },
  "/cashier/orders": { action: "process", resource: "orders" },

  // User routes
  "/profile": { action: "read", resource: "users" },
  "/reservations": { action: "read", resource: "reservations" },
  "/reservations/create": { action: "create", resource: "reservations" },
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const routeKey = Object.keys(routePermission).find((key) => {
    if (key.includes("[id]")) {
      const pattern = key.replace("[id", "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname.startsWith(key);
  });

  if (routeKey) {
    const { action, resource, businessLogic } = routePermission[routeKey];

    //Get session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    //prepare context for business logic
    let context = {};
    if (businessLogic) {
      context = await businessLogic(request, session.user.id);
    }

    const hasAccess = await hasPermission({
      action: action as any,
      resource: resource as any,
      userId: session.user.id,
      userRole: session.user.role as UserRole,
      context,
    });

    if (!hasAccess) {
      await logAudit(
        session.user.id,
        session.user.role as UserRole,
        `Unauthorized_${action}`,
        resource,
        { pathname }
      );

      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    await logAudit(
      session.user.id,
      session.user.role as UserRole,
      action,
      resource,
      { pathname }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sign-in|sign-up|unauthorized).*)",
  ],
};
