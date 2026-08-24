const FALLBACK_RETURN_TO = "/dashboard";

const allowedPathPrefixes = ["/admin", "/cart", "/checkout", "/dashboard", "/menu", "/orders", "/pos"];
const staffInvitationToken = /^[A-Za-z0-9_-]{32,128}$/;

export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return FALLBACK_RETURN_TO;
  }

  try {
    const parsed = new URL(value, "https://k-coffee.internal");
    const path = parsed.pathname;
    const invitationToken = parsed.searchParams.get("token");
    const isStaffAcceptance = path === "/staff/accept"
      && [...parsed.searchParams.keys()].every((key) => key === "token")
      && invitationToken
      && staffInvitationToken.test(invitationToken);
    const isAllowed = allowedPathPrefixes.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    );

    // Query values are intentionally not carried through login until a route
    // explicitly defines and tests the parameters it needs to retain.
    if (isStaffAcceptance) return `/staff/accept?token=${encodeURIComponent(invitationToken)}`;
    return isAllowed ? path : FALLBACK_RETURN_TO;
  } catch {
    return FALLBACK_RETURN_TO;
  }
}

export function loginUrlFor(returnTo: string | null | undefined): string {
  return `/login?callbackUrl=${encodeURIComponent(safeReturnTo(returnTo))}`;
}
