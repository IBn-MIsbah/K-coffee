# Phase A — Contain Risk Implementation Plan

**Priority:** P0 / release blocker  
**Objective:** Establish reliable, server-enforced authorization before staff, customer accounts, uploads, orders, or production credentials are exposed.

This plan expands Phase A from [the system audit](SYSTEM_AUDIT_AND_REMEDIATION_PLAN.md). It is intentionally limited to risk containment; it does not implement checkout, payments, or the full staff dashboards.

## Definition of done

Phase A is complete only when all of the following are true:

1. Anonymous users cannot access protected pages or invoke protected mutations.
2. A customer cannot access cashier or admin data/actions; a cashier cannot access admin data/actions.
3. Every privileged server action and route handler verifies the session and permission itself.
4. The database permission matrix is deterministic, repeatable, and tested.
5. Uploads are restricted to permitted staff and safe image files.
6. Denied access has a safe, usable response and useful audit record.
7. The automated and manual role matrices pass in a clean environment.

## Guardrails for this phase

- Do not rely on sidebar visibility, client redirects, or proxy matching as authorization.
- Do not release real Blob credentials until upload protection is complete.
- Do not create order endpoints until Phase B, but establish reusable ownership and status-policy patterns now.
- Avoid changing the database permission schema unless required; repair the current records with an idempotent seed/repair task.
- Every mutation must validate its input and authorize the caller before touching data or external services.

## Task sequence

### A0 — Confirm policy and prepare a safe branch

**Purpose:** Remove ambiguity before enforcing role controls.

- [ ] Create a dedicated branch, for example `security/phase-a-contain-risk`.
- [ ] Record the current route inventory and all current server entry points:
  - pages beneath `app/(protected)/`;
  - `app/api/**/route.*` handlers;
  - files containing `"use server"`;
  - Better Auth endpoints under `app/api/auth/[...all]`.
- [ ] Confirm the allowed roles for each existing route. The minimum expected policy is below.
- [ ] Decide how denied browser requests behave:
  - unauthenticated browser navigation → `/login?returnTo=<safe path>`;
  - authenticated but unauthorized page → `/unauthorized` with HTTP-equivalent 403 semantics;
  - unauthorized API/action → structured 401/403 response, never an HTML redirect.
- [ ] Decide the initial customer cancellation policy, even though cancellation ships in Phase B. Recommended default: own order only, `PENDING` only, within 30 minutes.
- [ ] Back up the development database before repairing permissions. For production, schedule the equivalent managed-database snapshot.

**Route policy to approve**

| Route / capability | Allowed roles | Notes |
| --- | --- | --- |
| `/dashboard` | authenticated user | Redirect based on role only. |
| `/dashboard/user/**` | `USER`, `CASHIER`, `ADMIN`, `SUPERADMIN` only if a shared account page is intentional; otherwise `USER` only | Prefer a dedicated account route if staff should not receive customer UI. |
| `/dashboard/cashier/**` | `CASHIER`, `ADMIN`, `SUPERADMIN` | Add store scope when stores/orders are implemented. |
| `/dashboard/admin/**` | `ADMIN`, `SUPERADMIN` | Product upload and administration live here. |
| Role assignment | `SUPERADMIN` | Must prevent removal of the last superadmin. |
| Product image upload | `ADMIN`, `SUPERADMIN` | Validate file before Blob write. |
| Public product read | everyone | Only active products; enforced in Phase B. |
| Future order read/cancel | owner, plus privileged staff as policy allows | Must load the order from DB, never trust a path or client payload. |

**Completion evidence:** Approved policy table, a database backup/snapshot reference, and a route/entry-point inventory in the pull request.

### A1 — Establish a server-side authorization boundary

**Purpose:** Give pages, route handlers, and server actions one correct way to authenticate and authorize a caller.

**Files to add**

- [ ] `lib/authz.ts` (or similarly named server-only module).
- [ ] A typed authorization error/response utility if needed, e.g. `lib/authz-errors.ts`.

**Implementation tasks**

- [ ] Mark the authorization module server-only (`import "server-only"`) so it cannot be bundled into client code.
- [ ] Implement `getCurrentSession()` using `auth.api.getSession({ headers: await headers() })`.
- [ ] Implement `requireSession()`:
  - return a typed session/user object on success;
  - throw/return a typed unauthenticated result on failure;
  - do not expose raw session tokens or internals.
- [ ] Implement `requireRole(allowedRoles)` for page/layout use.
- [ ] Implement `requirePermission({ action, resource, context? })` for mutation/API use.
- [ ] Keep role and permission types in one module. Replace `any` casts at callers with typed action/resource values.
- [ ] Create separate adapters for response context:
  - page/layout adapter redirects to login or renders a 403 boundary;
  - route handler adapter returns `NextResponse.json` with 401/403;
  - server action adapter returns a typed result usable by the form/UI.
- [ ] Implement `safeReturnTo(value)` that accepts only local paths beginning with one `/`, rejects protocol-relative URLs (`//...`), and falls back to `/dashboard`.
- [ ] Add unit tests covering no session, allowed role, denied role, invalid role string, and unsafe return URLs.

**Design decision:** `hasPermission` may remain database-backed, but no caller may query it without a verified server session. `SUPERADMIN` bypass must be explicit, tested, and logged for mutations.

**Completion evidence:** Every new protected entry point can call a small, shared helper; no UI-only authorization logic is required for security.

### A2 — Apply authorization to the actual route tree

**Purpose:** Fix the gap where the code protects `/admin` and `/cashier` while the app actually uses `/dashboard/admin` and `/dashboard/cashier`.

**Files to modify**

- [ ] `app/(protected)/layout.tsx`
- [ ] `app/(protected)/dashboard/page.tsx`
- [ ] `app/(protected)/dashboard/(grouped)/layout.tsx`
- [ ] `app/(protected)/dashboard/(grouped)/admin/**`
- [ ] `app/(protected)/dashboard/(grouped)/cashier/**`
- [ ] `app/(protected)/dashboard/user/**`
- [ ] `proxy.ts`

**Implementation tasks**

- [ ] Keep `app/(protected)/layout.tsx` responsible for a baseline authenticated session only.
- [ ] Add role checks inside the admin and cashier route layouts (create scoped layouts if the current route groups do not permit distinct enforcement).
- [ ] Enforce the policy before fetching sensitive dashboard data.
- [ ] Change `/dashboard` role redirect to handle a missing/invalid role safely and use the centralized role type.
- [ ] Simplify `proxy.ts` to a non-authoritative first line of defence:
  - restrict matcher scope to routes where an early redirect helps;
  - use exact real prefixes such as `/dashboard/:path*`;
  - do not use dynamic-path string replacement to authorize business actions;
  - do not write an audit row for every page view;
  - preserve a safe requested path only for login redirects.
- [ ] Remove or defer route map entries for routes that do not exist (`/admin`, `/cashier`, `/profile`, `/reservations`) until their real pages/actions exist.
- [ ] Add `/unauthorized` page with a neutral explanation, a safe back/dashboard option, and no detail about protected resources.
- [ ] Add a `not-found` and generic error boundary to protected sections where missing in scope.
- [ ] Ensure existing sidebar filtering is treated as a usability feature only; correct its links or hide unimplemented destinations in the same change.

**Completion evidence:** Direct URL entry, client-side navigation, and page refresh all enforce the same role rules.

### A3 — Repair and lock down the permission matrix

**Purpose:** Make `Permission.allowedRoles` match the intended role model after every seed.

**Files to modify/add**

- [ ] `lib/rbac.ts`
- [ ] `prisma/seed.ts`
- [ ] `scripts/repair-permissions.ts` or an explicitly documented seed command
- [ ] `tests/unit/rbac.*` (framework selected in A6)

**Implementation tasks**

- [ ] Define permissions in a normalized structure keyed by `(action, resource)` with an array/set of roles, rather than emitting one database row per role.
- [ ] Ensure shared permissions are unions. For example, `read:orders` must include both `USER` and `CASHIER` if that is policy.
- [ ] Treat `manage:all`/`*` consistently. Either keep the superadmin short-circuit and omit its DB row, or persist it deliberately; do not do both ambiguously.
- [ ] Reject unknown action/resource combinations at compile time where possible and at runtime before a DB query.
- [ ] Make seeding idempotent: rerunning it produces the same records and does not silently remove legitimate policy members.
- [ ] Write and run a repair task that replaces the current permission rows from the approved source-of-truth matrix.
- [ ] Add a verification command that prints the persisted matrix in deterministic order for code review/staging checks.
- [ ] Do not depend on the permission table for UI display until it is repaired; UI permissions must use the same server policy.

**Minimum regression cases**

- [ ] Seed twice; all rows and allowed roles remain unchanged.
- [ ] `USER` can read allowed own-order capability but cannot manage orders/products.
- [ ] `CASHIER` can process allowed order capability but cannot manage products/users.
- [ ] `ADMIN` can manage approved operational resources but cannot assign superadmin privileges.
- [ ] `SUPERADMIN` receives approved universal access.

**Completion evidence:** A before/after permission export and passing matrix test suite.

### A4 — Replace unsafe order-policy placeholders with reusable rules

**Purpose:** Eliminate authorization logic that grants access based on invented request context.

**Files to modify/add**

- [ ] `lib/rbac.ts`
- [ ] `lib/order-policy.ts` (new; no checkout endpoint required yet)
- [ ] `proxy.ts`
- [ ] Unit tests for policy helpers

**Implementation tasks**

- [ ] Remove the cancellation logic that sets `orderUserId` to the requesting user.
- [ ] Remove the misspelled `orgerAge` context default and the `orderDate === new Date()` cashier check.
- [ ] Define pure policy helpers, for example:
  - `canReadOrder(actor, order)`;
  - `canCancelOrder(actor, order, now)`;
  - `canTransitionOrder(actor, order, nextStatus)`.
- [ ] Make each helper consume an order record fetched by a server handler/action. Do not accept `userId`, status, created time, or store ID from browser input as authoritative.
- [ ] Define allowed transitions in a single transition table. Recommended baseline: `PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP → COMPLETED`, with `PENDING → CANCELLED` only under policy.
- [ ] Use a fixed clock/`now` argument in tests so cancellation-window tests are deterministic.
- [ ] Do not expose future order URLs or actions until the handler loads the order, calls the helper, and logs the allowed mutation.

**Completion evidence:** Policy tests prove a customer cannot read/cancel another customer’s order, cannot cancel a late/non-pending order, and a cashier cannot perform disallowed transitions.

### A5 — Secure image uploads and product-management entry points

**Purpose:** Stop anonymous/unsafe external storage writes.

**Files to modify/add**

- [ ] `lib/actions/upload.ts`
- [ ] `app/(protected)/dashboard/(grouped)/admin/add-product/page.tsx`
- [ ] `lib/upload-policy.ts` (optional pure validator)
- [ ] Upload action tests

**Implementation tasks**

- [ ] Call `requirePermission({ action: "manage", resource: "products" })` before reading the file or calling Vercel Blob.
- [ ] Verify the server environment has the required Blob configuration; return a safe configuration error without leaking secret values.
- [ ] Permit only an explicit image MIME allow-list (for example JPEG, PNG, WebP, AVIF) and reject SVG unless it is sanitized by a dedicated process.
- [ ] Enforce a byte limit before upload; decide and document the limit (recommended: 5 MB for v1).
- [ ] Validate actual image content/dimensions server-side, not MIME type alone, using a vetted image parser.
- [ ] Generate a server-controlled object path such as `products/<uuid>.<safe-extension>`; do not use the raw submitted filename as the storage key.
- [ ] Return only the resulting public URL and minimal metadata to the client.
- [ ] Create an audit event for success/failure with actor, action, resource, object key/resource ID, and request metadata. Never log file contents or credentials.
- [ ] Add UI loading/error feedback and a labelled file input. Do not imply that a product was created until the later validated product mutation succeeds.
- [ ] Confirm Blob read access is intentionally public only for public product images; otherwise use signed access.

**Completion evidence:** Anonymous/customer upload attempts fail; admin upload tests validate valid images, invalid MIME, oversized input, malformed image, and audit logging.

### A6 — Add focused security tests and a manual role matrix

**Purpose:** Prove the boundary works and prevent regression while Phase B adds new endpoints.

**Testing setup tasks**

- [ ] Choose a test stack compatible with the existing Next.js 16 project (for example Vitest for unit tests and Playwright for browser flows).
- [ ] Add scripts: `typecheck`, `test:unit`, `test:integration`, and `test:e2e` as each suite is introduced.
- [ ] Add an isolated test database strategy or mocked repository layer for authorization/policy integration tests.
- [ ] Make lint ignore local generated/tooling directories such as `.agents/**` so app checks represent application code.

**Automated minimum test matrix**

| Scenario | Expected result |
| --- | --- |
| Anonymous → `/dashboard/admin` | Login redirect; return path is local and safe. |
| `USER` → `/dashboard/admin` | Denied; no protected content/data appears. |
| `USER` → `/dashboard/cashier` | Denied. |
| `CASHIER` → admin product upload | 403/denied action. |
| `ADMIN` → product upload with valid image | Allowed; audit record created. |
| `ADMIN` → oversized/invalid image | Rejected before Blob upload. |
| Permission seed run twice | Identical expected matrix. |
| Customer reads/cancels another order | Denied. |
| Crafted `returnTo=https://attacker.example` | Redirect falls back to a local route. |

**Manual role matrix**

- [ ] Seed or create one account for each role: `USER`, `CASHIER`, `ADMIN`, `SUPERADMIN`.
- [ ] Test fresh login, direct URL entry, refresh, sidebar navigation, and logged-out access for each role.
- [ ] Test each account against admin and cashier routes, upload action, and future order-policy helpers.
- [ ] Record the outcomes in the pull request/checklist; investigate every unexpected allow/deny result.

**Completion evidence:** Automated checks pass and the signed/manual matrix is attached to the release work item.

### A7 — Release the containment changes safely

**Purpose:** Avoid permission repair or new guards locking out legitimate staff.

- [ ] Deploy first to staging with production-like role accounts and a safe Blob test credential.
- [ ] Run the permission repair/seed task once and export the matrix before and after.
- [ ] Verify at least one known admin and cashier account can still access their intended routes.
- [ ] Verify an ordinary customer account cannot access either staff area.
- [ ] Monitor auth, denied-access, and upload-error logs during the rollout; alert on a sudden spike in 403s or authentication failures.
- [ ] Prepare rollback:
  - revert code deployment;
  - restore the pre-change permission snapshot if authorization records were changed incorrectly;
  - preserve audit logs for incident investigation.
- [ ] Update the system audit task status and block Phase B until the Phase A exit gate is signed off.

## File-level implementation map

| File | Phase A change |
| --- | --- |
| `lib/auth.ts` | Harden Better Auth configuration only after confirming supported trusted-origin/cookie options; do not expose secrets. |
| `lib/authz.ts` | New canonical session/role/permission helpers. |
| `lib/rbac.ts` | Normalize permission matrix; remove unsafe business-rule defaults. |
| `lib/order-policy.ts` | New pure ownership/cancellation/transition policy helpers. |
| `proxy.ts` | Reduce to safe early redirects/matching; remove authoritative business authorization. |
| `app/(protected)/layout.tsx` | Baseline authenticated boundary. |
| Dashboard layouts/pages | Add role-specific server enforcement based on the approved route policy. |
| `lib/actions/upload.ts` | Authorize, validate, safely name, audit, and upload images. |
| Admin upload page | Present truthful loading/error states; no implied product creation. |
| `prisma/seed.ts` | Invoke idempotent permission sync/repair. |
| `scripts/repair-permissions.ts` | New explicit repair/export utility if seed alone is not sufficient. |
| `app/unauthorized/page.tsx` | New safe unauthorized experience. |
| Test files/config | New policy, permission, action, and browser coverage. |

## Estimated dependency order

`A0 → A1 → (A2 + A3) → A4 → A5 → A6 → A7`

Tasks A2 and A3 can proceed in parallel after A1 because route enforcement and permission normalization share the helpers but modify separate concerns. A4 and A5 must use the finalized helpers. A6 starts with unit coverage during A1/A3 and finishes after all implementation work.

## Phase A sign-off checklist

- [ ] Approved route and role policy exists.
- [ ] All protected pages/actions verify authorization on the server.
- [ ] Actual dashboard URLs are protected by role.
- [ ] Permission records are repaired and idempotent.
- [ ] Uploads are authenticated, authorized, validated, and audited.
- [ ] Unsafe order authorization placeholders are removed.
- [ ] Unauthorized, error, and safe-return flows work.
- [ ] Automated matrix passes in CI/staging.
- [ ] Manual role matrix passes in staging.
- [ ] Rollback plan and permission backup are verified.

