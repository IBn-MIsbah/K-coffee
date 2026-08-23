import { auth } from "@/lib/auth";
import { loginUrlFor } from "@/lib/return-to";
import { NextRequest, NextResponse } from "next/server";

/**
 * This proxy only provides an early authentication redirect. Authorization is
 * enforced inside server layouts, route handlers, and server actions where the
 * real resource and actor are available.
 */
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const pathname = request.nextUrl.pathname;

  if (session?.user) {
    const role = session.user.role;
    if (pathname === "/" && role === "CASHIER") {
      return NextResponse.redirect(new URL("/pos", request.url));
    }
    if (pathname === "/" && (role === "ADMIN" || role === "SUPERADMIN")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") return NextResponse.next();

  const loginUrl = new URL(loginUrlFor(pathname), request.url);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/", "/admin/:path*", "/cart", "/checkout", "/dashboard/:path*", "/orders/:path*", "/pos"],
};
