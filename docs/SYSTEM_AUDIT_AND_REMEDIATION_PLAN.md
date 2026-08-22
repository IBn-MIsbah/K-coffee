# K-Coffee System Audit & Remediation Plan

**Audit date:** 2026-08-22  
**Scope:** Current Next.js application, Prisma schema, Better Auth configuration, RBAC/proxy, server actions, customer storefront, staff dashboards, and delivery controls.

## Executive summary

K-Coffee has a good visual foundation, a product catalogue, Better Auth email/password sign-in, a Prisma/PostgreSQL schema, and early role definitions. It is **not ready to accept real orders or operate as a staff system**.

The immediate concern is authorization: the actual dashboard routes are not role-protected, the RBAC permission seed overwrites shared permissions, and the image-upload server action has no authorization or file validation. Commerce is also incomplete: the menu does not add items to the persisted cart, the cart page is a placeholder, and no checkout/order-creation flow exists.

Do not launch with real customers, staff, payments, or production blob credentials until Priority 0 and Priority 1 are complete.

## Current capability matrix

| Area | Current state | Release readiness |
| --- | --- | --- |
| Public marketing site | Landing page and navigation exist; several linked pages remain generic or incomplete. | Partial |
| Product catalogue | Products can be listed and viewed. Active-state enforcement is inconsistent. | Partial |
| Cart | Zustand persistence exists, but items duplicate, menu does not use it, and the cart page is a placeholder. | Not usable |
| Checkout and orders | Schema exists, but there is no order API/action, checkout, payment, or order history. | Missing |
| Authentication | Better Auth email/password sign-up and sign-in exist. Recovery, verification, rate limiting, and hardened configuration are absent. | Prototype only |
| Authorization | Role enum, permission table, and RBAC module exist, but protection does not cover real routes and business checks are unsafe. | Unsafe |
| Admin and cashier operations | Dashboard shells exist; pages are placeholders. Product "management" only uploads an image. | Missing |
| Data and operations | Prisma schema and seed exist; stores are not seeded although every order requires one. | Incomplete |
| Quality controls | No unit/integration/browser test suite, no typecheck script, and lint includes local skill scripts. | Missing |

## Findings and required changes

### Priority 0 — security and access control blockers

| ID | Finding | Evidence | Required change | Acceptance criteria |
| --- | --- | --- | --- | --- |
| SEC-01 | Dashboard routes have authentication but no role authorization. Any signed-in user can request staff dashboard URLs. | `app/(protected)/layout.tsx` checks only for a session; `proxy.ts` maps `/admin` and `/cashier`, while the app uses `/dashboard/admin` and `/dashboard/cashier`. | Create server-side `requireSession`, `requireRole`, and `requirePermission` helpers. Apply them to every protected page, route handler, and server action; use the real `/dashboard/**` route map. | A `USER` receives 403/redirect from all cashier/admin routes and APIs; a cashier cannot access admin functions; tests cover allowed and denied routes. |
| SEC-02 | RBAC seed corrupts permissions shared by roles. Each `upsert` replaces `allowedRoles`, so later roles overwrite earlier roles for the same action/resource. | `lib/rbac.ts`, `initializePermissions`. | Make role permission definitions the single source of truth and upsert the union of allowed roles per `(action, resource)`. Add a migration/repair script for existing permission rows. | The persisted matrix exactly matches the declared matrix after repeated seeds. |
| SEC-03 | Order business rules are not based on database records. Cancellation context assigns the current user as the order owner and defaults age to zero; cashier processing defaults to denial. | `proxy.ts` and `lib/rbac.ts`. | Load the target order server-side, verify ownership/store/status/time, and centralize allowed status transitions. Fix the `orgerAge` typo. Never infer authorization context from the request path alone. | Ownership, cancellation-window, store scope, and transition tests pass. |
| SEC-04 | The upload server action is callable without session, role, file-size/type checks, or a controlled filename/path. | `lib/actions/upload.ts`; invoked by `dashboard/.../add-product/page.tsx`. | Require an admin permission in the action; validate MIME type, byte size, image decoding, filename/path generation, and Blob configuration. Log mutations. | Anonymous/customer uploads fail; valid admin uploads succeed within documented limits. |
| SEC-05 | Authorization is currently treated as route/UI behavior, not a server boundary. Future mutation endpoints would be bypassable without server checks. | RBAC is only invoked from `proxy.ts`; current server action has none. | Require authorization and schema validation inside every server action/route handler before data access or mutation. | Direct requests to protected endpoints cannot bypass UI route guards. |

### Priority 1 — core ordering and data integrity blockers

| ID | Finding | Evidence | Required change | Acceptance criteria |
| --- | --- | --- | --- | --- |
| ORD-01 | There is no checkout or order-creation implementation. | No order route/action; cart page is `Coming Soon`. | Decide v1 fulfilment/payment policy, then implement a transactional `createOrder` action that reloads products/prices, validates store/pickup, snapshots totals, creates items, and writes an audit event. | Valid cart creates exactly one order; retries are idempotent; client prices cannot affect totals. |
| ORD-02 | The data model cannot fully represent a launch-ready order. | `prisma/schema.prisma`. | Add currency, subtotal/tax/discount/total snapshots, fulfilment type, contact/note snapshot, payment state/provider reference, status timestamps, idempotency key, and relevant indexes. | Migrations apply cleanly; order detail can display a durable historical record. |
| ORD-03 | Every order requires a store, but the seed creates none. | `Order.storeId` required; `prisma/seed.ts` creates users/products only. | Seed active store locations, hours, timezone, pickup capacity/intervals; add store management. | Clean setup produces an orderable store and catalogue. |
| ORD-04 | The cart cannot support checkout safely. | `lib/store/useCart.ts`, `app/(public)/cart/page.tsx`. | Merge identical products; add update/decrement/remove/clear; derive count and totals; make the header badge live; validate quantity bounds; clear only after confirmed order creation. | Cart is correct after navigation/reload and cannot contain negative quantities or client-authoritative prices. |
| ORD-05 | The menu's Add to Cart path only shows a toast; product detail has a separate, sign-in-gated cart path. | `app/(public)/menu/page.tsx`, `components/menu/MenuItems.tsx`, `menu/[productId]/page.tsx`. | Use one cart service/store from both pages. Decide whether anonymous carting is allowed; require sign-in only at checkout if guest browsing remains supported. | Adding from list/detail produces the same cart state and header count. |
| ORD-06 | Product availability is exposed inconsistently. | `app/(public)/menu/api/route.ts` does not filter `isActive`; product API attempts `findUnique` with an `isActive` filter. | Use `findFirst` or a valid compound query for public detail, enforce `isActive: true` in all public product queries, and return stable error shapes. Add pagination/category IDs. | Inactive products are inaccessible publicly and valid product detail requests work. |

### Priority 2 — authentication and account experience

| ID | Finding | Required change | Acceptance criteria |
| --- | --- | --- | --- |
| AUTH-01 | Sign-in and registration lack a complete recovery/verification policy. | Decide whether verified email is mandatory. Add password reset, verification, secure resend limits, and session-expiry behavior. | Users can recover access; unverified accounts follow the documented policy. |
| AUTH-02 | Auth forms have accessibility and feedback gaps. The login inline error is disabled, password toggle lacks an accessible name, and redirect handling is not consistently safe. | Display inline errors with an accessible live region, label controls, add loading states consistently, validate callback URLs against an allow-list, and retain the user’s intended route safely. | Keyboard/screen-reader login flow succeeds; failure is announced and understandable. |
| AUTH-03 | Production auth controls are not explicit. | Configure trusted origins, HTTPS-only secure cookies, secret rotation procedure, rate limits/abuse protection, and audit events for sign-in failures and privilege changes. | Production configuration review passes and abuse tests are rate-limited. |
| AUTH-04 | User account/order views are placeholders. | Build profile/preferences, order history/detail, and cancellation UI after the order domain is complete. | Customers can access only their own account/order data. |

### Priority 3 — staff operations and functional completeness

| ID | Finding | Required change | Acceptance criteria |
| --- | --- | --- | --- |
| OPS-01 | Admin, cashier, and user dashboard pages are placeholders. | Implement an order queue for cashiers; metrics, product/category/location management, and audit viewer for admins; account/order history for users. | Each role completes its core daily workflow without direct database access. |
| OPS-02 | Sidebar links do not match implemented routes. | Replace `/order`, `/customers`, `/staff`, `/settings` with real, role-specific routes or hide them until built. | Every navigation item resolves to a permitted page. |
| OPS-03 | Product management is only an upload form and does not create/update products. | Build validated create/edit/archive flows with server-side role checks; archive rather than delete referenced products. | Admin can safely manage the catalogue; changes are audited. |
| OPS-04 | Reservation is modelled but has no user-facing or operational workflow. | Either remove it from v1 permission/UI scope or implement availability, booking, management, and cancellation rules. | No exposed, non-functional reservation path remains. |

### Priority 4 — design system, usability, and public content

| ID | Finding | Required change | Acceptance criteria |
| --- | --- | --- | --- |
| UX-01 | The revised landing page follows the Stitch concept, but menu, auth, cart, and dashboard use separate visual systems. | Extract shared colour, typography, spacing, button, card, form, and status tokens from the Stitch design; apply them across public, auth, and staff areas. | Core routes look like one product and meet AA contrast. |
| UX-02 | Several public pages and footer links use placeholder/generic content. | Add confirmed locations, hours, contact data, legal text, and social URLs, or remove unavailable links. | No fake contact details, dead social links, or placeholder legal pages remain. |
| UX-03 | Product customisation choices are visual only and are not stored/priced. | Remove non-functional options from v1 or model options/modifiers and include them in cart/order snapshots. | Every selectable option affects a real, validated order. |
| UX-04 | Resilience/accessibility coverage is incomplete. | Add loading, empty, error, not-found, and unauthorized states; audit semantic headings, labels, focus, target size, reduced motion, and mobile layouts. | Critical flows pass keyboard and 320px–1440px browser checks. |

### Priority 5 — engineering quality and operations

| ID | Finding | Required change | Acceptance criteria |
| --- | --- | --- | --- |
| ENG-01 | There is no test suite or CI release gate. | Add unit tests (cart, RBAC, totals, transitions), integration tests (auth/order/ownership), and Playwright critical flows. Gate pull requests with install, lint, typecheck, tests, and production build. | A clean CI run verifies all critical paths. |
| ENG-02 | `npm run lint` scans local `.agents` files and fails on non-app CommonJS scripts; the documented typecheck command does not exist. | Ignore non-product local tooling in ESLint; add `typecheck` and test scripts; keep application lint warnings at zero. | The documented commands pass from a clean checkout. |
| ENG-03 | The production build currently relies on fetching Google-hosted Inter at build time. | Self-host the font or make the build environment’s network/proxy policy explicit. | A production build succeeds in CI without an undeclared external fetch dependency. |
| ENG-04 | README claims checkout, Stripe, React Hook Form, Zod, and Resend capabilities not present in the code. | Correct the README, provide `.env.example`, document migrations/seeding/auth smoke test, and distinguish implemented from planned features. | New developers can set up and verify the system without undocumented steps. |
| ENG-05 | Observability and operational safety are absent. | Add structured error reporting, protected health checks, DB backup/restore procedure, audit retention, deployment rollback, and payment/webhook runbooks if payments are selected. | Staging rehearsal covers failure and rollback scenarios. |

## Delivery plan (task mode)

### Phase A — contain risk (Priority 0, first)

- [ ] Confirm v1 business decisions: payment, pickup/delivery, guest checkout, cancellation window, locations/hours/timezone, and notifications.
- [ ] Add server auth helpers and replace route-map-based security with route/page/action enforcement.
- [ ] Repair permission seeding and add a role matrix test.
- [ ] Protect and validate uploads; remove unauthorised Blob access.
- [ ] Add unauthorized/not-found/error handling and safe login return URLs.
- [ ] Run a manual role matrix against customer, cashier, admin, and superadmin accounts.

**Exit gate:** No anonymous or customer account can read/write staff resources; all privileged actions are server-authorized.

### Phase B — make ordering real (Priority 1)

- [ ] Apply order/store schema migration and seed real development locations.
- [ ] Implement a single cart API/store and the complete cart page.
- [ ] Implement server-validated, idempotent order creation and confirmation.
- [ ] Implement the chosen payment method (pay-at-pickup or Stripe plus webhooks).
- [ ] Add customer order history/detail and policy-controlled cancellation.

**Exit gate:** A user can create exactly one valid pickup order from an active product and see it afterward.

### Phase C — staff workflows (Priority 2–3)

- [ ] Build cashier order queue with allowed transitions and store scope.
- [ ] Build admin product/category/location management and audit viewer.
- [ ] Build account settings and staff role management with last-superadmin protection.
- [ ] Resolve or remove reservations and all dead dashboard navigation.

**Exit gate:** Staff can fulfil orders and administrators can maintain catalogue/locations without database access.

### Phase D — finish the product experience (Priority 2–4)

- [ ] Complete account recovery/verification and auth feedback.
- [ ] Replace public placeholders with approved business/legal content.
- [ ] Apply shared Stitch-based design tokens to storefront, auth, cart, and dashboards.
- [ ] Add all responsive, accessibility, and resilience states.

**Exit gate:** Public and authenticated journeys are usable, accessible, consistent, and free of non-functional UI.

### Phase E — release engineering (Priority 5, continuous then final)

- [ ] Add unit, integration, and browser tests before/during each phase.
- [ ] Make lint/typecheck/build reliable in CI; isolate local tooling from app checks.
- [ ] Add monitoring, backups, runbooks, staged migration testing, and rollback rehearsal.
- [ ] Update README, `.env.example`, architecture notes, and release checklist.

**Exit gate:** Staging CI and an end-to-end role-based rehearsal pass before production launch.

## Recommended implementation order

1. Phase A before any public deployment or staff rollout.
2. Phase B before building dashboards around orders.
3. Phase C after the order/status model is stable.
4. Phase D in parallel with Phase C where it does not change core commerce contracts.
5. Phase E runs continuously; its final release gate is mandatory.

## Decisions required from the product owner

1. Is v1 **pickup only** or does it include delivery?
2. Is payment **at pickup** or through **Stripe**?
3. Is checkout authenticated-only, or is guest checkout required?
4. What are the cancellation, refund, and order-status transition policies?
5. Which locations, operating hours, currency, and tax rules are real for launch?
6. Is reservation functionality in v1, deferred, or removed?

