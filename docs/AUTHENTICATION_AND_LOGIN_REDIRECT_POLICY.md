# Authentication, authorization, and login redirect policy

**Reviewed:** 2026-08-22  
**Roles:** `USER`, `CASHIER`, `ADMIN`, `SUPERADMIN`  
**Authentication:** Better Auth email/password session

## Policy goals

- Public catalogue and informational content remain browseable without an account.
- Ordering is authenticated-only. A customer signs in before checkout and may only see or change their own account and orders.
- Staff capability is enforced on the server at the page and mutation boundary; hiding a sidebar link is never authorization.
- A login redirect retains a safe, same-site destination. External URLs and protocol-relative URLs are rejected.
- API requests return JSON `401` (not authenticated) or `403` (not authorized); they never redirect to HTML login pages.

## Current route protection matrix

| Route / interface | Login required | Authorized roles | Current unauthenticated result | Current unauthorized result | Intended post-login destination |
| --- | --- | --- | --- | --- | --- |
| `/`, `/menu`, `/menu/[productId]`, `/cart` | No | Everyone | View page | N/A | N/A |
| `/about`, `/careers`, `/contact`, `/locations`, `/privacy`, `/terms` | No | Everyone | View page | N/A | N/A |
| `/login`, `/register` | No (guest-only) | Signed-out visitors | N/A | A signed-in visitor is redirected to `/dashboard` | `/dashboard`, or the validated `returnTo` destination for login |
| `/checkout` | Yes | `USER`, `CASHIER`, and `SUPERADMIN` with `create:orders` permission (the current `ADMIN` matrix does not grant it) | Protected layout redirects to `/login?returnTo=%2Fdashboard` today | The order API returns `403` if the account lacks `create:orders` | **Target:** `/checkout` so the cart/pickup flow resumes |
| `/orders/[orderId]` (confirmation) | Yes | Order owner only | Protected layout redirects to `/login?returnTo=%2Fdashboard` today | `notFound()` for another user’s order | **Target:** original confirmation URL, then verify ownership |
| `/dashboard` | Yes | All known roles | `/login?returnTo=%2Fdashboard` | `/unauthorized` for an unknown role | Role landing: admin → `/dashboard/admin`; cashier → `/dashboard/cashier`; user → `/dashboard/profile` |
| `/dashboard/profile` | Yes | All known roles; self only | `/login?returnTo=%2Fdashboard` today | `/unauthorized` if actor invalid | **Target:** `/dashboard/profile` |
| `/dashboard/orders`, `/dashboard/orders/[orderId]` | Yes | All known roles; records are self-owned | `/login?returnTo=%2Fdashboard` today | `/unauthorized` or `notFound()` for another user’s order | **Target:** requested dashboard order route |
| `/dashboard/cashier` | Yes | `CASHIER`, `ADMIN`, `SUPERADMIN`; server permission `process:orders` also applies | `/login?returnTo=%2Fdashboard` today | `/unauthorized` | **Target:** `/dashboard/cashier` |
| `/dashboard/admin`, `/dashboard/admin/add-product` | Yes | `ADMIN`, `SUPERADMIN`; server permissions apply per action | `/login?returnTo=%2Fdashboard` today | `/unauthorized` | **Target:** requested admin URL |
| `/dashboard/admin/staff`, `/dashboard/admin/audit` | Yes | `SUPERADMIN` | `/login?returnTo=%2Fdashboard` today | `/unauthorized` | **Target:** requested superadmin URL |
| `/orders`, `/dashboard/user` | Yes because they are in the protected group | All signed-in users, but they are placeholders | `/login?returnTo=%2Fdashboard` today | N/A | Replace with permanent canonical redirects: `/dashboard/orders` and `/dashboard/profile` |
| `/unauthorized` | No | Everyone | View page | N/A | User chooses a public route or signs in with another account |

### API and server-action policy

| Endpoint / action | Login required | Authorization requirement | Failure response |
| --- | --- | --- | --- |
| `POST /api/orders` | Yes | `create:orders`; server validates product, pricing, store, pickup capacity, and account ownership | JSON `401` / `403` |
| `GET/PUT /api/account/profile` | Yes | Current account only | JSON `401` / `403` |
| `POST /api/account/orders/[orderId]/cancel` | Yes | Current order owner plus cancellation policy | JSON `401` / `403`; avoid exposing another order |
| `POST /api/staff/orders/[orderId]/status` | Yes | `process:orders` and assigned-store scope | JSON `401` / `403` |
| `/api/admin/products/[productId]` and image upload action | Yes | `manage:products` | JSON `401` / `403` or server-action error |
| `/api/admin/staff/[userId]/role`, `/stores` | Yes | `SUPERADMIN` | JSON `401` / `403` |
| `/api/products/[id]`, `/menu/api` | No | Public data only; inactive products must remain hidden | Public `404` for unavailable records |
| `/api/auth/[...all]` | Depends on Better Auth operation | Better Auth validation, rate limits, trusted origins, and CSRF/session controls | Provider-defined structured auth response |

## Required redirect changes

The protected route-group layout currently calls `requirePageSession("/dashboard")`, so every unauthenticated protected-page visit loses its original destination. Replace this with a request-aware helper or per-route `returnTo` values so the login page receives the actual safe pathname and permitted query parameters.

| Situation | Required redirect |
| --- | --- |
| Anonymous visitor opens `/checkout` | `/login?returnTo=%2Fcheckout` |
| Anonymous visitor opens `/dashboard/orders/abc` | `/login?returnTo=%2Fdashboard%2Forders%2Fabc` |
| Customer opens `/dashboard/cashier` | `/unauthorized` (do not redirect to a staff login destination) |
| Signed-in visitor opens `/login?returnTo=/checkout` | `/checkout` after confirming the return target is safe; otherwise role landing |
| Signed-in visitor opens `/register` | `/dashboard` role landing |
| Login succeeds with no `returnTo` | `/dashboard`, which performs role landing |
| Login succeeds with a stale or newly forbidden target | Role landing or `/unauthorized`; never loop between login and the protected page |
| Logout succeeds | `/` with a confirmation message; do not retain protected route state |

`safeReturnTo` already rejects non-path and `//` values. Extend it to allow only an internal pathname plus a small allow-list of safe query parameters, and never accept a full external URL.

## Missing auth-related pages and controls

1. Password reset request and reset completion.
2. Email verification, verification-expired, and resend-verification pages.
3. Session-expired/re-authentication message for sensitive account changes.
4. Account lockout/rate-limit feedback that does not reveal whether an email exists.
5. Staff invitation/activation flow instead of manual credentials or role changes alone.
6. Account deletion/privacy-request workflow if required by the approved privacy policy.

## Acceptance checks

- An anonymous customer who opens checkout signs in and returns to checkout with their local cart intact.
- A `USER` cannot reach staff/admin pages or mutate their APIs by typing a URL or sending a direct request.
- A cashier can only process orders at assigned stores; an admin cannot use superadmin staff/audit functions.
- A customer cannot enumerate or view another customer’s order by changing an ID.
- Login rejects `returnTo=https://attacker.example`, `//attacker.example`, and malformed paths.
- Sign-in, sign-out, password changes, privilege changes, and denied privileged actions are consistently audited under the approved retention policy.
