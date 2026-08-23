# Phase F0 — Route correction and login-intent implementation plan

**Parent:** `FEATURE_AND_ACCESS_REMEDIATION_PLAN.md`  
**Priority:** P0  
**Goal:** Preserve a visitor’s safe intended destination through authentication, remove placeholder legacy routes, and provide non-disclosing not-found experiences.

## Outcome

After this phase, an unauthenticated visitor who opens any protected route is sent to login with that exact internal route as `returnTo`. After successful authentication, they resume that route if their role and resource access allow it. They cannot use `returnTo` to leave K-Coffee or to bypass role/ownership checks.

## Current state and gap

| Area | Current behavior | Gap to close |
| --- | --- | --- |
| `proxy.ts` | Preserves pathname and query for `/dashboard/**` and `/orders/**`. | `/checkout` is not matched, so it falls through to the protected layout. |
| Protected layout | Redirects every unauthenticated request to login with `returnTo=/dashboard`. | It loses the requested protected route. |
| Login form | Validates a path-like `returnTo` on the client and pushes it after sign-in. | It needs one shared, tested sanitization contract with server redirects. |
| Auth layout | Redirects every already signed-in `/login` or `/register` visit to `/dashboard`. | It cannot honour a safe login `returnTo`. |
| Legacy routes | `/orders` and `/dashboard/user` render placeholders. | They should redirect to canonical working pages. |
| Not-found states | Order pages call `notFound()`, but branded route-specific `not-found.tsx` boundaries are absent. | Missing public, protected, and order-safe 404 UX. |

## Non-goals

- Do not add password reset, verification, invitations, or notification flows; those belong to Phase F1/F4.
- Do not change RBAC permissions, order ownership policy, pickup policy, or database schema.
- Do not redirect an authenticated user around a valid authorization failure. Staff/customer role denial remains `/unauthorized`; an unknown or inaccessible order remains `notFound()`.

## Implementation steps

### F0.1 — Define a single safe internal-return contract

1. Keep `safeReturnTo` in `lib/authz.ts` as the canonical sanitizer and test it directly.
2. Define the accepted format as an internal absolute path starting with a single `/`.
3. Reject all of the following, returning the fallback `/dashboard`:
   - empty, missing, non-string, or whitespace-only values;
   - `http:`, `https:`, other schemes, or backslashes;
   - protocol-relative values such as `//host`;
   - values that cannot be parsed as an internal URL;
   - paths outside the allow-list of routable application prefixes.
4. Permit query parameters only for explicitly supported protected pages. Initially retain no query parameters unless a current route requires one; add them one at a time with tests.
5. Do not accept a fragment as a server redirect target. It is never sent to the server and should not be relied on for resumption.
6. Export a small helper to create the login URL, such as `loginUrlFor(returnTo)`, so proxy/layout/page code cannot encode or sanitize differently.

**Files expected:** `lib/authz.ts`, new `tests/unit/authz.test.ts`.

### F0.2 — Make edge authentication cover every protected URL

1. Extend `proxy.ts` matcher coverage to include `/checkout` in addition to `/dashboard/:path*` and `/orders/:path*`.
2. Preserve exactly `request.nextUrl.pathname` plus the approved query string when constructing `returnTo`.
3. Pass the generated value through the shared safe-return contract before writing it to the login URL.
4. Keep the proxy authentication-only. Do not place role, order ownership, or store-scope checks in it; page and endpoint guards remain authoritative.
5. Retain the protected layout as a defense-in-depth fallback for environments where the proxy does not run, but do not let it claim that it can reconstruct a missing pathname. Its fallback must remain a safe role landing (`/dashboard`).

**Files expected:** `proxy.ts`, `app/(protected)/layout.tsx`, `lib/authz.ts`.

### F0.3 — Correct guest-only login and registration behavior

1. Move the signed-in redirect decision out of `app/(auth)/layout.tsx`, because that layout cannot receive the login page’s `searchParams` reliably.
2. Make `app/(auth)/login/page.tsx` a server page that reads `returnTo`, checks the current session, and redirects an already signed-in visitor to the sanitized target; otherwise it renders `LoginForm`.
3. Pass the already-sanitized target to `LoginForm` as a prop, or maintain equivalent client-safe parsing that calls a shared pure helper. Avoid separate, drifting validation logic.
4. Preserve `callbackURL` and client navigation after Better Auth sign-in, using only that sanitized target.
5. Make `app/(auth)/register/page.tsx` preserve an approved `returnTo` after successful registration if the product owner wants registration to resume checkout. Otherwise document and enforce `/dashboard` as the single registration landing path.
6. Ensure a signed-in visitor to `/login?returnTo=/checkout` goes to checkout, while `/login?returnTo=https://example.com` goes to `/dashboard`.
7. Keep success/error messages accessible: use an `aria-live` region, accurate “Redirecting” copy, required email input, and labelled password visibility controls while touching these forms.

**Files expected:** `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `components/forms/LoginForm.tsx`, `app/(auth)/register/page.tsx` or a new register client component.

### F0.4 — Replace duplicate placeholder routes with canonical redirects

1. Change `app/(protected)/orders/page.tsx` to a server `redirect("/dashboard/orders")`.
2. Change `app/(protected)/dashboard/user/page.tsx` to a server `redirect("/dashboard/profile")`.
3. Use temporary redirects initially while validating production traffic; make them permanent only after analytics/logs show no incompatible client dependency.
4. Confirm these legacy routes remain behind the protected group so unauthenticated visitors still enter the normal login process and authenticated visitors land on the canonical page.
5. Search the application for old links and replace them with canonical `/dashboard/orders` and `/dashboard/profile` links.

**Files expected:** the two legacy page files, sidebar/header/navigation components, route tests.

### F0.5 — Add safe not-found boundaries

1. Add a public `app/not-found.tsx` with a branded 404 page and links to home/menu.
2. Add `app/(protected)/not-found.tsx` with a signed-in appropriate 404 message and links to dashboard/profile/orders. It must not reveal whether a missing resource ever existed.
3. Add an order-specific not-found boundary if route-group behavior requires it, ensuring both an invalid ID and another user’s ID show the same generic response.
4. Preserve the existing `app/(protected)/error.tsx` retry behavior and add compatible error handling for public routes if needed.
5. Verify the not-found UI is keyboard navigable, responsive, and uses semantic heading/link structure.

**Files expected:** `app/not-found.tsx`, `app/(protected)/not-found.tsx`, optionally order-route `not-found.tsx`.

### F0.6 — Prove behavior with automated and manual checks

1. Add Vitest cases for `safeReturnTo` and login URL construction:
   - valid: `/checkout`, `/dashboard/orders/order_123`;
   - rejected: `https://host`, `//host`, `javascript:...`, `\\host`, whitespace, and malformed URLs;
   - fallback: `/dashboard`.
2. Add a proxy-focused test or integration assertion verifying that anonymous `/checkout`, `/dashboard/orders/id`, and `/orders/id` requests contain the expected encoded `returnTo`.
3. Add Playwright authenticated fixtures and cover:
   - anonymous visitor: cart → checkout → login → checkout;
   - signed-in visitor: `/login?returnTo=/checkout` → checkout;
   - signed-in visitor: malicious `returnTo` → `/dashboard`;
   - `USER` visiting cashier/admin route → `/unauthorized`;
   - one user visiting another user’s order → generic 404;
   - legacy routes → canonical routes;
   - public and protected unknown URLs → appropriate branded 404.
4. Run `npm run check`, `npm run test:unit`, browser tests once added, and `npm run build` in CI.
5. Capture screenshots/traces for failing browser cases and record the final evidence in the production-readiness report.

## Route behavior after F0

| Initial request | Visitor state | Required outcome |
| --- | --- | --- |
| `/checkout` | Signed out | `/login?returnTo=%2Fcheckout`; successful login returns to `/checkout`. |
| `/dashboard/orders/abc` | Signed out | `/login?returnTo=%2Fdashboard%2Forders%2Fabc`; successful login then verifies order ownership. |
| `/dashboard/cashier` | Signed-in `USER` | `/unauthorized`; no role-based login loop. |
| `/login?returnTo=/checkout` | Signed in | `/checkout`. |
| `/login?returnTo=//attacker.example` | Signed in or signed out | Ignore unsafe target; use `/dashboard` after sign-in. |
| `/orders` | Signed in | Redirect to `/dashboard/orders`. |
| `/dashboard/user` | Signed in | Redirect to `/dashboard/profile`. |
| Unknown protected order URL | Any signed-in account | Generic protected 404; no ownership/existence disclosure. |

## Completion checklist

- [ ] Shared return-target sanitizer and login URL helper are implemented and unit tested.
- [ ] Proxy protects checkout and preserves a safe original destination for all protected URL families.
- [ ] Auth pages honour safe login intent for already signed-in users.
- [ ] Login and registration use the approved post-authentication landing behavior.
- [ ] Legacy placeholders redirect to canonical pages and no internal links target them.
- [ ] Public/protected/order not-found states are present and non-disclosing.
- [ ] Unit, browser, lint, typecheck, and production-build gates pass in CI.

## Exit criteria

Phase F0 is complete only when the route behavior table is automated, no external URL can be used as a post-login destination, customer/staff authorization still occurs server-side after authentication, and all placeholder legacy routes have been removed or redirected.
