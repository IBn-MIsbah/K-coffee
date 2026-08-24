# Customer Dashboard Experience Implementation Plan

**Status:** Planned  
**Objective:** Evolve the authenticated `USER` dashboard into a focused pickup-ordering workspace: understand the active order, resume ordering, reorder safely, manage preferences, and get help without exposing data or creating unimplemented promises.

## 1. Current baseline

The customer journey already provides:

- authenticated-only cart and checkout;
- pickup-only, pay-at-pickup orders in ETB with 15% VAT and 20-minute pickup intervals;
- customer order history, order detail, status timeline, and policy-controlled cancellation;
- a profile page that updates name and phone number; and
- role-based route protection for customer, cashier, admin, and superadmin areas.

The canonical customer entry is `/dashboard`, which currently redirects a `USER` to `/dashboard/profile`. The implementation below changes that landing point to a purposeful customer overview while keeping `/dashboard/profile` and `/dashboard/orders` as dedicated destinations.

## 2. Guardrails and non-goals

- Every customer dashboard page and API must require `role === USER` at the server boundary. Client checks are only usability improvements.
- Reuse the existing `Order`, `OrderItem`, `StoreLocation`, `Product`, and `User.preferences` data where possible. Do not weaken historical price snapshots.
- Use `Africa/Addis_Ababa`/the selected store timezone for all pickup times and dates.
- Do not add online payment, delivery, automatic refunds, loyalty points, promotions, SMS, push notifications, or reservations in this phase.
- Do not make an order transition depend on a notification delivery succeeding.
- Use Zod validation for every request payload, clear inline form errors, and toast notifications only for action outcomes.
- Preserve staff/admin redirects: customer-only features must redirect `CASHIER` to `/pos` and `ADMIN`/`SUPERADMIN` to `/admin/dashboard`.

## 3. Delivery order

`C0 contracts and dashboard shell → C1 active-order experience → C2 recent history and reorder → C3 favourites/preferences → C4 order support → C5 communication preferences → C6 account security → C7 responsive/accessibility/release proof`

Each increment must be independently usable and covered before the following increment begins.

---

## C0 — Establish the customer dashboard foundation

**Goal:** Make `/dashboard` the customer home without duplicating or disrupting existing profile and order pages.

1. Add a customer dashboard service, for example `lib/dashboard/customer-dashboard-service.ts`, which returns only data owned by the authenticated customer:
   - most relevant active order, if one exists;
   - current cart item count and total from the client cart state (not the database);
   - the most recent completed/cancelled orders for a compact history section; and
   - safe profile-summary fields needed in the header.
2. Define the active-order selection rule in one place. Recommended order:
   - `READY_FOR_PICKUP`, then `PREPARING`, `CONFIRMED`, and `PENDING`;
   - earliest pickup time first; then newest order as a deterministic fallback.
3. Implement `app/(protected)/dashboard/(grouped)/page.tsx` (or adjust the canonical grouped route) to render the customer overview for `USER` and retain the role redirects for staff.
4. Add a dashboard navigation item labelled **Home** for customers. Keep **My orders** and **Profile** as separate links.
5. Design loading, empty, and error states:
   - no active order: “Start a pickup order” with links to `/menu` and `/cart`;
   - no order history: explain that completed pickup orders will appear there;
   - unavailable data: friendly retry guidance without database details.
6. Add unit tests for active-order selection and ownership filtering, plus a browser test confirming a `USER` lands on the overview while staff do not.

**Acceptance gate:** A customer who visits `/dashboard` sees only their own account/order summary; users with no orders receive a useful ordering CTA; staff never see customer dashboard content.

## C1 — Surface the active pickup order

**Goal:** Let a customer understand exactly what to do next without opening several pages.

1. Create a reusable `ActivePickupOrderCard` server-presentational component using the same status labels and transition order as `/dashboard/orders/[orderId]`.
2. Include:
   - order number and concise status;
   - formatted pickup date/time and store timezone;
   - store name, address, phone when approved, and a directions link only when coordinates/directions are available;
   - ETB total and pay-at-pickup reminder;
   - item count; and
   - actions: **View order**, **Cancel order** only when `canCustomerCancel` permits it, and **Get help**.
3. Display a time-sensitive pickup indicator only when it can be calculated reliably. Avoid claiming a preparation countdown or live queue position until operational data supports it.
4. Reuse the existing cancel API and cancel button; after success, refresh the dashboard and announce the change accessibly.
5. Add tests for all statuses, cancelled orders, missing pickup time, and ownership.

**Acceptance gate:** An active customer order can be understood and reached in one screen, with no unsafe status action or misleading estimate.

## C2 — Improve history and add safe reorder

**Goal:** Make repeat pickup orders fast without mutating historical orders or adding unavailable products.

1. Enhance the compact recent-orders module on the dashboard with the last three to five orders and a **View all orders** link.
2. Add a server-side reorder-preview endpoint/action requiring `USER` ownership of the source order. It must:
   - load order items server-side;
   - resolve current products and active categories;
   - exclude archived/inactive/deleted products;
   - use current product prices, never the historical order-item price; and
   - return available items plus per-item unavailability reasons.
3. Add a `reorder` client control on completed and cancelled orders. Require a confirmation view before replacing or merging cart contents.
4. Define cart behavior explicitly:
   - default: replace the existing cart after confirmation;
   - show an item-by-item preview with current price/quantity;
   - let the user cancel without changing the cart;
   - preserve existing cart if the request fails.
5. Use the existing cart authorization guard before writing the local cart. Staff and guests must not be able to invoke this operation.
6. Add empty state when every historical item is unavailable, and a partial-success message when only some items can be added.
7. Test product archiving, category archiving, price changes, another user’s order ID, empty cart, and replacement confirmation.

**Acceptance gate:** A customer can safely recreate an eligible previous order using current catalogue data, and no unavailable or historically priced item enters the cart.

## C3 — Add favourites and pickup preferences

**Goal:** Reduce repeat-order friction with user-controlled, low-risk personalization.

### C3.1 Favourites

1. Add a `FavoriteProduct` model (`userId`, `productId`, timestamps) with a unique `[userId, productId]` constraint and indexes for customer and product lookups.
2. Create an incremental Prisma migration; never alter applied migration history.
3. Add authenticated `USER` endpoints/actions to list, add, and remove favourites. Verify the product is active and public before saving or returning it.
4. Add a favourite toggle on menu cards/product detail and a dashboard **Your favourites** section.
5. Handle product retirement gracefully: retain the preference record or remove it by approved policy, but never render a purchasable inactive item.
6. Add Zod request validation, API/RBAC tests, and browser coverage for add/remove and archived-product behavior.

### C3.2 Pickup preferences

1. Define and validate a small versioned `User.preferences` object, for example:
   - `defaultStoreId` (optional);
   - `marketingEmailOptIn` (handled in C5);
   - optional beverage-preference notes only if they are not used as order instructions.
2. Validate a default store is active before saving it; if archived later, clear the preference or prompt the customer at checkout.
3. Add a **Pickup preferences** panel to Profile with a store selector and explanatory copy: checkout always confirms the final store and time.
4. Preselect the valid default store in checkout but never bypass available-slot validation.
5. Test malformed JSON, inactive store IDs, changed/archived stores, and customer ownership.

**Acceptance gate:** Favourites and default-store preferences are private, validated, and never make an inactive product/store available for ordering.

## C4 — Add an order-specific support workflow

**Goal:** Replace generic “speak to staff” guidance with a traceable, privacy-safe path.

1. Obtain an operations decision before implementation: support inbox/owner, service hours, response target, retention duration, escalation handling, and whether support staff may view order notes.
2. Add an `OrderSupportRequest` model only after the decision, containing order ID, customer ID, category, customer message, status, assigned owner if applicable, and timestamps. Do not store payment credentials or unnecessary sensitive data.
3. Build **Get help with this order** from the order detail and dashboard active-order card:
   - category selection (missing item, incorrect item, pickup issue, other);
   - bounded message length;
   - order number shown but not editable;
   - clear expected response channel/time based on approved operations policy.
4. Server-side, prove the order belongs to the `USER`, validate with Zod, rate-limit submissions, write an audit event, and return a generic safe error on failure.
5. Build a staff/admin support queue only after defining who is authorized; restrict access by store assignment where appropriate.
6. Test cross-account requests, rate limits, status transitions, retention handling, and accessible form feedback.

**Acceptance gate:** Customers can request help for their own order without exposing another customer’s information, and the business has an accountable way to receive and resolve it.

## C5 — Add notification and communication preferences

**Goal:** Give customers clarity about necessary order communication and control over optional marketing.

1. Confirm provider, sender identity, verified domain, consent wording, retention, retry policy, unsubscribe mechanism, and delivery monitoring before enabling messages.
2. Keep transactional order messages separate from marketing consent. Order receipt/status messages must not depend on a marketing opt-in.
3. Add a persistent notification-delivery record only if retries/reporting are required: order ID, event type, destination category, provider message ID, attempt count, status, timestamps, and safe error classification.
4. Trigger order received, ready-for-pickup, cancellation, and exception notifications after the order transaction commits. A failed send must not roll back an order/status change.
5. Add profile preferences for optional marketing email only after the exact policy is approved. Store consent timestamp and policy/version identifier.
6. Add resend/retry controls only for authorized operational users and rate-limit them.
7. Test idempotency, failed-provider handling, no-secret logging, opt-out, and accessibility of preference controls.

**Acceptance gate:** Notifications are consent-aware, observable, resilient to provider failure, and never block valid pickup operations.

## C6 — Complete account safety and privacy controls

**Goal:** Let customers manage their account without weakening account security or retention obligations.

1. Add change-password flow using the authentication provider’s supported server-side API. Require an authenticated session and, where supported, recent credential confirmation.
2. Add change-email flow only after verifying the new email and protecting against account enumeration. Clearly explain that sign-in identity changes after confirmation.
3. Add session/device management if supported by the authentication provider: list current/recent sessions, revoke other sessions, and show a clear current-device state.
4. Provide data-access and account-deletion request intake, not automatic deletion, until the legal/retention policy defines order-history, tax, audit, and fraud-prevention obligations.
5. Audit sensitive account changes without writing passwords, reset tokens, full session tokens, or other secrets to logs.
6. Test unauthenticated access, stale sessions, token expiry, session revocation, account ownership, and generic safe error responses.

**Acceptance gate:** Customers can update credentials and start privacy requests through protected, auditable workflows with no secret leakage.

## C7 — UX quality, accessibility, and release proof

**Goal:** Make the dashboard dependable at the actual devices and conditions used by customers.

1. Apply the existing K-Coffee visual system consistently: readable hierarchy, ETB formatting, Ethiopian-local date/time labels, 44px minimum interactive targets, and accessible focus states.
2. Test responsive behavior at 375px, 768px, and 1440px. The active-order card, reorder preview, favourites, and forms must not rely on hover or horizontal scrolling.
3. Provide loading/skeleton, empty, offline/error, and success states for every dashboard module.
4. Validate keyboard navigation, visible focus, semantic headings, form labels, error announcements, contrast, and reduced-motion behavior.
5. Extend the Playwright role matrix:
   - guest is redirected from dashboard/cart;
   - customer sees only own dashboard/order/favourites/preferences;
   - cashier/admin/superadmin are redirected away from customer routes;
   - customer can perform reorder and support flows;
   - responsive dashboard screenshots/flows pass.
6. Extend PostgreSQL integration tests for ownership, archived catalogue behavior, preference validation, notification idempotency (when enabled), and support-request authorization.
7. Run lint, typecheck, unit tests, integration tests, browser tests, production build, and `graphify update .`; document results before merging.

**Acceptance gate:** The customer dashboard works across supported viewports, passes accessibility/role/security coverage, and meets existing CI release gates.

## 4. Data and route inventory

| Increment | Likely new/changed routes | Data change |
| --- | --- | --- |
| C0–C1 | `/dashboard` customer overview | None required |
| C2 | Reorder preview/action under `/api/account/orders/[orderId]/reorder` | None required |
| C3 | Favourite APIs; profile preference update | `FavoriteProduct` migration; versioned `User.preferences` contract |
| C4 | `/api/account/orders/[orderId]/support` and authorized staff queue | `OrderSupportRequest` only after policy approval |
| C5 | Preference and delivery-status endpoints | Notification delivery model only after provider/retention approval |
| C6 | Auth-provider-backed credential/session routes | Depends on provider capabilities and approved privacy retention |

## 5. Required decisions before gated work

| Decision | Blocks |
| --- | --- |
| Cart merge vs. replace policy for reorder | C2 |
| Whether inactive favourites are retained or automatically removed | C3 |
| Support owner, recipient, SLA, and retention | C4 |
| Transactional-email provider, consent wording, sender identity, and monitoring | C5 |
| Password/email/session-management capabilities and privacy retention policy | C6 |
| Loyalty/reward rules, fraud controls, liability, and accounting treatment | Any future loyalty phase |

## 6. Completion definition

This plan is complete when a `USER` can land on a useful dashboard, understand and manage their active pickup, safely reorder using current catalogue rules, manage personal preferences and account security, seek help for their own order, and receive approved communications—while staff roles remain excluded, all mutations are server-authorized and validated, and the full quality/release suite passes.
