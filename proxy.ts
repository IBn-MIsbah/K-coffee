import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * This proxy only provides an early authentication redirect. Authorization is
 * enforced inside server layouts, route handlers, and server actions where the
 * real resource and actor are available.
 */
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "returnTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/orders/:path*"],
};
