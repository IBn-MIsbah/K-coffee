# K-Coffee Release Plan

## Goal

Ship a production-ready coffee ordering application in which customers can discover products, manage a cart, place and track pickup orders, and staff can manage products and fulfil orders through role-appropriate dashboards.

## Current baseline

The project already has a Next.js/Prisma/PostgreSQL foundation, Better Auth email/password authentication, roles, a product catalogue, product detail pages, a persisted client cart store, an image upload action, and a seeded administrator/cashier.

The following blocks a functional release today:

- The cart page is a placeholder and the header count is hard-coded.
- Cart entries are duplicated instead of merged, and cannot be updated or removed.
- No order creation, checkout, payment, or order-history service is implemented.
- `Order.storeId` is required, but the seed does not create store locations.
- User, cashier, admin, and orders pages are placeholders.
- Several public pages are placeholders (locations, about, contact, careers, privacy, and terms).
- The RBAC proxy does not match the actual `/dashboard/...` route structure and has inconsistent resource names.
- There is no automated test suite or production release gate.

## Release definition

### Required for version 1

1. Customer can register, log in, browse active products, manage a cart, choose a pickup location/time, and submit an order.
2. Customer can view current and past orders and cancel only eligible orders.
3. Cashier can view and move orders through the fulfilment lifecycle.
4. Admin can manage products, categories, locations, and order status; the superadmin can manage staff roles.
5. Every protected action is enforced on the server, audited, tested, and observable in production.
6. The site passes build, lint, type-check, database migration, smoke, and critical browser-flow checks before release.

### Explicit product decisions to make before implementation

These decisions change the data model and checkout implementation, so they must be agreed before Phase 3:

- **Payment model:** pay at pickup for v1, or Stripe card payment at checkout.
- **Fulfilment model:** pickup only for v1, or delivery too.
- **Guest checkout:** authenticated users only for v1, or allow guest orders with phone/email capture.
- **Order cancellation policy:** for example, customer may cancel while `PENDING` and within 30 minutes.
- **Store setup:** initial real locations, hours, timezone, and pickup time-slot interval/capacity.
- **Customer communication:** in-app only, email receipts/status alerts, or SMS as well.

## Work plan

## Phase 0 — Stabilize the foundation

**Purpose:** Make local development, database state, configuration, and verification reproducible before adding features.

### Tasks

1. Create `.env.example` that matches the active configuration exactly:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `NEXT_PUBLIC_APP_URL` if retained for public browser configuration
   - Blob, payment, and email variables only when their features are enabled.
2. Standardize local URLs on `http://localhost:3000`; configure production URLs only through deployment environment variables.
3. Resolve documentation drift in `README.md`:
   - remove claims that checkout, Stripe, React Hook Form, Zod, and Resend are implemented until they are;
   - document the correct Prisma v7 migration and seed commands;
   - document the login smoke test.
4. Add a deterministic seed package:
   - active categories and products with usable images/descriptions;
   - at least one active `StoreLocation` with hours and pickup metadata;
   - test users with roles;
   - idempotent upserts for every record.
5. Add required package scripts:
   - `typecheck` (`tsc --noEmit`),
   - targeted test commands,
   - `test:login`,
   - migration/seed setup command for a clean database.
6. Ensure generated folders and Playwright artefacts are ignored appropriately; do not commit local sessions or screenshots unless intentionally retained as test fixtures.

### Exit criteria

- A new developer can configure, migrate, seed, log in, and start the app from the README without manual database repair.
- `npm run build`, lint, typecheck, and `npm run test:login` pass in a clean environment.

## Phase 1 — Secure authentication and authorization

**Purpose:** Make every user and staff route safe before exposing business operations.

### Tasks

1. Refactor authorization into server-side helpers such as `requireSession`, `requireRole`, and `requirePermission`.
2. Correct the route map to match real URLs:
   - `/dashboard/admin/**`,
   - `/dashboard/cashier/**`,
   - `/dashboard/user/**`,
   - `/orders/**`,
   - any product-management and staff-management API routes.
3. Normalize RBAC resource names (`orders`, not both `order` and `orders`) and validate every permission in one place.
4. Enforce authorization in route handlers/server actions, not only in the proxy or hidden UI.
5. Implement an `Unauthorized` page and preserve a safe return URL when redirecting to login.
6. Complete auth usability/accessibility:
   - visible inline login/register errors in addition to toast notifications;
   - labelled password visibility controls;
   - disabled/loading submit states;
   - password reset and email verification policy, if required for launch;
   - session-expiry handling and logout confirmation/feedback.
7. Add security controls:
   - rate limiting for sign-in/sign-up endpoints;
   - server-side input validation;
   - audit events for sign-in failures, privilege changes, product changes, and order-status changes;
   - production trusted origins and secure-cookie validation.

### Exit criteria

- Anonymous users cannot access protected pages or APIs.
- A customer cannot access staff data; cashier and admin permissions are separately verified.
- Role tests cover allowed and denied paths for each role.

## Phase 2 — Finish the customer storefront

**Purpose:** Make discovery and cart management complete, predictable, and mobile-friendly.

### Tasks

1. Replace placeholder public pages with launch-ready content:
   - real store locations/hours/contact information,
   - about and careers content or remove them from navigation,
   - privacy and terms approved for the selected payment/communication model,
   - working social links or remove their placeholders.
2. Complete the product catalogue:
   - active/inactive filtering on the server;
   - category filtering and empty/error/retry states;
   - product availability messaging;
   - optimized images and valid fallbacks;
   - accessible labels and focus behavior.
3. Rebuild the cart store:
   - merge identical product IDs by incrementing quantity;
   - add decrease, remove, and clear actions;
   - derive subtotal, item count, taxes/fees, and total;
   - guard against invalid quantities and stale prices;
   - render the real header cart badge.
4. Implement the cart page:
   - line items, quantity controls, remove action, total summary, and empty state;
   - persist cart locally for anonymous browsing;
   - require sign-in at checkout if guest checkout is excluded.
5. Validate all cart/order inputs on the server, using a shared schema layer rather than trusting persisted browser state.

### Exit criteria

- At 320px through desktop, a visitor can add, change, and remove products with a correct persisted total.
- The cart count is accurate after page reload and route navigation.
- No cart manipulation can create a negative quantity, inactive product, or client-controlled price.

## Phase 3 — Create the ordering and checkout domain

**Purpose:** Turn cart data into reliable, auditable orders.

### Data model changes

1. Add order fields required by the payment and fulfilment decision:
   - currency,
   - subtotal, tax, discount, and total snapshots,
   - fulfilment type,
   - customer contact snapshot,
   - optional note,
   - payment status/provider/payment intent reference,
   - status transition timestamps.
2. Add database constraints/indexes for order lookup, status queues, store/date views, and payment identifiers.
3. Seed store locations before enabling checkout.
4. Decide whether inventory is launch scope; if yes, add product stock/reservation fields and transactional decrement logic.

### Application tasks

1. Implement a transactional `createOrder` server action/API:
   - authenticate/authorize customer if required;
   - reload products/prices from the database;
   - reject inactive products and invalid quantities;
   - calculate totals server-side;
   - validate store and pickup slot;
   - generate collision-safe order numbers;
   - create order/items atomically;
   - audit the event;
   - return an order confirmation payload.
2. Build checkout UI:
   - selected store and pickup time;
   - customer contact/notes;
   - clear price summary;
   - prevention of duplicate submission;
   - success, failure, and retry states.
3. Implement the selected payment flow:
   - **pay at pickup:** record the intent and clear the cart after order confirmation;
   - **Stripe:** create payment intents server-side, confirm in the UI, verify webhooks, reconcile payment/order states, and handle failures/refunds.
4. Clear or reconcile the local cart only after the server confirms order creation.

### Exit criteria

- A signed-in customer can place a valid order end-to-end.
- Price, product state, store, and order totals are authoritative on the server.
- Repeated clicks or network retries do not create duplicate orders.

## Phase 4 — Customer account and order tracking

**Purpose:** Give customers visibility and control after checkout.

### Tasks

1. Replace `dashboard/user` with account summary, active orders, recent orders, and account preferences.
2. Implement order history/detail pages with secure ownership checks.
3. Show an understandable status timeline: `PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP → COMPLETED`.
4. Implement cancellation under the agreed policy, using server-enforced ownership/status/time checks.
5. Add optional order receipt/status notifications after the communication decision is made.

### Exit criteria

- Customers can view only their own orders, track state, and cancel only eligible orders.

## Phase 5 — Staff and administration operations

**Purpose:** Make day-to-day store work executable without direct database access.

### Cashier workspace

1. Replace the cashier placeholder with a live order queue scoped to the selected/current store.
2. Add order detail, status actions, customer/pickup context, and clear status-transition feedback.
3. Enforce allowed transition rules, for example no direct `PENDING → COMPLETED` unless explicitly authorized.
4. Add queue filtering/sorting by status, pickup time, and search/order number.

### Admin workspace

1. Replace the admin placeholder with operational metrics: orders by status, sales, average preparation time, and recent activity.
2. Complete product management:
   - create/edit/archive products;
   - validate decimal price/category/image;
   - do not hard-delete products referenced by orders;
   - audit mutations.
3. Implement category and store-location management.
4. Add staff/user management for the superadmin:
   - role assignment/removal;
   - prevent self-lockout and last-superadmin removal;
   - audit every role change.
5. Add a protected audit-log viewer for authorized administrators.

### Exit criteria

- Staff can safely move live orders through fulfilment.
- Admin can maintain menu data and locations without database tooling.
- All mutations are role-protected and auditable.

## Phase 6 — Quality, accessibility, and performance

**Purpose:** Turn features into a release-quality experience.

### Automated tests

1. Unit tests for totals, order-number generation, status-transition rules, RBAC, and cart reducers.
2. Integration tests using an isolated test database for authentication, order creation, authorization, and rollback behavior.
3. Browser tests with Playwright for:
   - registration/login/logout;
   - mobile cart adjustments;
   - checkout confirmation;
   - customer cancellation policy;
   - cashier fulfilment;
   - denied authorization routes;
   - 320px, 375px, 414px, 768px, 1024px, and 1440px layouts.
4. Keep the existing login smoke test as a fast deployment health check.

### Quality checks

1. Resolve all lint errors and intentional warnings; exclude generated/vendor folders from linting rather than suppressing real code issues.
2. Confirm keyboard operation, visible focus states, semantic headings, labels, error announcements, and reduced-motion behavior.
3. Verify WCAG AA foreground/background contrast, including hover/focus/disabled states.
4. Optimize images with Next Image or vetted remote patterns; supply dimensions, loading strategy, and fallbacks.
5. Add error boundaries, not-found pages, loading states, and API error logging without leaking internals.
6. Add request validation and rate limits for public mutation endpoints.

### Exit criteria

- Critical user journeys pass on desktop and mobile in CI.
- No known high-severity accessibility, security, or data-integrity defect remains.

## Phase 7 — Production readiness and launch

**Purpose:** Deploy safely and operate the app after release.

### Tasks

1. Choose and configure production services:
   - managed PostgreSQL with backups and restore procedure;
   - Vercel or equivalent deployment;
   - image storage;
   - payment/email/SMS providers, if selected.
2. Configure production secrets and exact HTTPS `BETTER_AUTH_URL`/trusted origins.
3. Run migrations in a staging environment, seed only non-production fixture data, and test an upgrade from the existing schema.
4. Configure monitoring:
   - structured error tracking;
   - uptime check for home, auth, and a protected health endpoint;
   - database and payment-provider alerts;
   - audit-log retention policy.
5. Add CI gates for install, lint, typecheck, unit/integration tests, Playwright critical flows, and production build.
6. Write runbooks for rollback, failed payment, failed order creation, account access, data restore, and support escalation.
7. Perform launch rehearsal in staging with a real role matrix and an end-to-end test order.

### Release checklist

- Production domain, HTTPS, environment variables, migrations, and backups are confirmed.
- All release gates pass from a clean CI run.
- Admin, cashier, and customer acceptance tests pass.
- Monitoring and rollback owner are assigned.
- Legal/contact/location content is accurate and not placeholder text.

## Recommended delivery order

1. Phase 0 and Phase 1 first.
2. Phase 2 cart work.
3. Decide payment/fulfilment, then complete Phase 3.
4. Build Phase 4 and Phase 5 in parallel only after the order domain is stable.
5. Run Phase 6 continuously, then execute Phase 7 as the final release gate.

## Milestones

| Milestone | Outcome |
| --- | --- |
| Foundation ready | Reproducible setup, seeded stores/users/products, secure auth configuration |
| Customer ordering beta | Cart and pickup-order creation work end-to-end |
| Operations beta | Cashier queue and admin menu/store management are live |
| Release candidate | Automated tests, accessibility, security, and performance gates pass |
| Production launch | Monitored deployment, operational runbooks, and verified rollback path |
