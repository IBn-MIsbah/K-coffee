# Phase B — Make Ordering Real Implementation Plan

**Priority:** P1 / required before customer ordering is offered  
**Objective:** Turn the existing catalogue and persisted browser cart into a secure, server-authoritative pickup-order flow.

This follows [Phase A](PHASE_A_CONTAIN_RISK_IMPLEMENTATION_PLAN.md). The authorization helpers and order-policy primitives introduced in Phase A are prerequisites; Phase B must use them for every order mutation and read.

## Definition of done

1. Customers can add active products from both menu list and detail views into one consistent cart.
2. Cart quantities, item count, subtotals, and totals remain correct after refresh and navigation.
3. A signed-in customer can select a valid store and pickup time, then create exactly one server-validated order.
4. The server reloads product state/prices, calculates monetary values, and rejects invalid/inactive products, stores, quantities, and pickup times.
5. Duplicate clicks and network retries cannot create duplicate orders.
6. The cart clears only after an order confirmation is received.
7. Customers can view the new order in a safe confirmation view; staff functionality remains deferred to Phase C.

## Product decisions required before implementation

These decisions define the schema and checkout contract. Do not begin the checkout data migration until they are confirmed.

| Decision | Recommended v1 default | Why it matters |
| --- | --- | --- |
| Fulfilment | Pickup only | Avoids delivery-address, distance, driver, and tax complexity. |
| Payment | Pay at pickup | Enables real ordering before Stripe/webhook/refund scope. |
| Checkout identity | Authenticated customer required | Current product-detail flow already expects a session; order ownership is clearer. |
| Currency | Confirm one ISO currency code, e.g. `ETB` | Must be stored with money snapshots. |
| Tax/fees | Confirm rate/rule, or explicitly use zero tax for v1 | Server total calculation cannot be left ambiguous. |
| Pickup policy | Store hours, timezone, interval, capacity, minimum lead time | Determines valid pickup slots. |
| Cancellation | Owner, `PENDING` only, within 30 minutes | Matches the Phase A policy helper baseline. |
| Product modifiers | Defer until modelled | Current size/sweetness controls are non-functional and must be removed or implemented. |

## Guardrails

- Browser cart data is a convenience layer, never an order source of truth.
- Prices, active state, totals, store availability, and pickup eligibility are recalculated inside one database transaction.
- Use decimal values in the database; use integer minor units or a vetted money helper for application calculations.
- Do not use client timestamps, client order numbers, client totals, or client user IDs as authoritative values.
- Do not clear the cart on submit; clear it only after a confirmed order response.
- Require Phase A server authorization helpers in every order action/route.

## Task sequence

### B0 — Lock the order contract and establish test fixtures

- [ ] Approve every product decision above and record the values in `.env.example`/operations documentation where appropriate.
- [ ] Define `CreateOrderInput`: line item product IDs/quantities, `storeId`, `pickupTime`, optional customer note, and idempotency key.
- [ ] Define `CreateOrderResult`: order ID/number, status, money snapshots, selected store/pickup information, and an idempotent replay indicator if useful.
- [ ] Establish one deterministic development store with address, phone, hours, timezone, and pickup rule metadata.
- [ ] Add orderable fixture products with valid images, categories, Decimal prices, and active status.
- [ ] Add test fixtures for inactive products, closed stores, invalid slots, and two customers.

**Exit gate:** The checkout contract, money policy, pickup policy, and test data are approved before schema changes begin.

### B1 — Migrate the data model for durable orders and stores

**Files:** `prisma/schema.prisma`, new Prisma migration, `prisma/seed.ts`, generated types, test fixture helpers.

- [ ] Add order money snapshots: `currency`, `subtotalAmount`, `taxAmount`, `discountAmount`, and `totalAmount`.
- [ ] Add order context: fulfilment type, contact snapshot (only approved fields), customer note, payment status/method, status transition timestamps, and `idempotencyKey`.
- [ ] Add an idempotency uniqueness constraint scoped safely to the authenticated user (for example `@@unique([userId, idempotencyKey])` when user IDs are required).
- [ ] Add indexes for customer order history, store/status queues, pickup time, and idempotency lookups.
- [ ] Make `StoreLocation` capable of pickup validation: timezone, structured opening hours, slot interval/capacity, active status, and lead-time configuration. Use JSON only where the schema is documented and validated.
- [ ] Keep `OrderItem.price` as a historical unit-price snapshot; add names/options snapshots only if the v1 UI needs them after a product changes.
- [ ] Add enum values only after the v1 payment/fulfilment decisions are approved.
- [ ] Create a non-destructive Prisma migration; test it against a copy of existing development/staging data.
- [ ] Update seed to create at least one active store before any order test runs.

**Exit gate:** A clean migration and seed produce active stores, active products, valid permission data, and a schema that can express a complete order.

### B2 — Build one reliable client cart model

**Files:** `lib/store/useCart.ts`, a new cart selector/helper module, header, menu cards, product detail, cart page.

- [ ] Replace append-only `addItem` with merge-by-product-ID behavior.
- [ ] Add `increment`, `decrement`, `setQuantity`, `removeItem`, and `clearCart` actions.
- [ ] Reject zero, negative, non-integer, and unreasonably large quantities inside the store.
- [ ] Store only the display information needed for a browser cart; never trust stored price/name for checkout.
- [ ] Add derived selectors for total item count and subtotal display.
- [ ] Hydrate safely to avoid server/client mismatch; show a stable cart badge/loading state during hydration if necessary.
- [ ] Wire `MenuItems` and product detail to the same cart action and success feedback.
- [ ] Update the header cart badge to use the derived count rather than a hard-coded value.
- [ ] Remove or defer non-functional product modifiers; do not show size/sweetness options until their pricing/order representation exists.

**Acceptance checks**

- [ ] Adding the same item twice produces one cart line with a larger quantity.
- [ ] List-page and detail-page additions have identical results.
- [ ] Cart count and subtotal survive refresh.
- [ ] Removing/decrementing the final unit removes the line.

### B3 — Deliver a usable cart page

**Files:** `app/(public)/cart/page.tsx`, cart components, header/navigation.

- [ ] Replace `Coming Soon` with a client cart view.
- [ ] Display image/fallback, name, unit display price, quantity controls, line total, remove action, item count, and subtotal.
- [ ] Provide an accessible empty state with a menu CTA.
- [ ] Make quantity controls keyboard-accessible, labelled, and protected against invalid states.
- [ ] Clearly communicate that totals are estimates until checkout if price/tax can change.
- [ ] Add a checkout CTA that requires session before entering checkout; preserve the `/cart` return URL safely.
- [ ] Add loading/disabled states during cart mutations and checkout navigation.

**Exit gate:** At 320px through desktop, customers can manage every cart line and see a correct display subtotal.

### B4 — Create the server-authoritative order service

**Files:** new `lib/orders/*` service/policy/validation files, a server action or route handler, tests.

- [ ] Define a shared server validation schema for `CreateOrderInput`. Add Zod (or another approved validator) before exposing the endpoint; do not duplicate ad-hoc validation across UI and server.
- [ ] Require an authenticated actor using `requireActor`/`requirePermission` before order creation.
- [ ] Start a Prisma transaction and, inside it:
  - [ ] resolve all product IDs from the database;
  - [ ] verify every product is active and every quantity is valid;
  - [ ] reload Decimal prices and calculate subtotal/tax/discount/total server-side;
  - [ ] load the selected store and validate active status, opening hours, lead time, interval, capacity, and timezone;
  - [ ] generate a collision-safe customer-visible order number;
  - [ ] create the order and its items atomically;
  - [ ] persist the idempotency key/result;
  - [ ] write an audit event.
- [ ] On replay with the same idempotency key and customer, return the original order rather than duplicate it.
- [ ] Return stable client-safe error codes for invalid cart, inactive item, unavailable store/slot, and duplicate/in-progress request. Do not expose database internals.
- [ ] Keep an order creation endpoint/action narrowly scoped; staff status changes belong to Phase C.

**Acceptance checks**

- [ ] Client-supplied price changes do not affect the stored order.
- [ ] Inactive/missing products, invalid quantities, closed/inactive stores, and invalid slots fail without partial records.
- [ ] Two submissions with the same idempotency key create one order.
- [ ] Transaction failure leaves no orphaned order/items/audit artifacts.

### B5 — Build checkout and order confirmation

**Files:** new checkout route/components, server action client adapter, confirmation route, cart store.

- [ ] Create a checkout view with selected store, pickup slot, approved contact fields, optional note, order summary, and payment-at-pickup explanation.
- [ ] Fetch/derive stores and valid pickup slots from server data; never let the browser invent availability.
- [ ] Generate a new idempotency key when checkout begins and reuse it for a retry of the same submission.
- [ ] Disable submit while the request is in progress, show useful errors adjacent to their controls, and allow a safe retry.
- [ ] On confirmation response only: reconcile/clear cart, route to an order confirmation page, and render server-returned order details.
- [ ] On failure: retain cart, preserve valid customer input where appropriate, and never claim that an order was created.
- [ ] Add a receipt/confirmation route protected by order ownership using `canReadOrder` from Phase A.

**Exit gate:** A signed-in customer can complete one valid pickup/pay-at-pickup order, receive a confirmation, and cannot create duplicates through retries.

### B6 — Make public product reads order-safe

**Files:** `app/(public)/menu/api/route.ts`, `app/api/products/[id]/route.ts`, menu/detail pages, tests.

- [ ] Filter all public lists by `isActive: true`.
- [ ] Replace the invalid/ambiguous `findUnique` product-detail filter with a valid active-product query.
- [ ] Validate category/filter inputs and use category slug/ID rather than a display-name substring where possible.
- [ ] Add pagination or an explicit v1 catalogue limit.
- [ ] Return stable API error bodies and user-facing empty/error states.
- [ ] Ensure an inactive product cannot be added to a new order even if a stale browser cart still contains it.

**Exit gate:** An inactive product cannot be reached via public detail, added to checkout, or included in a created order.

### B7 — Test, stage, and release the ordering beta

**Automated tests**

- [ ] Unit: cart reducer/actions/selectors, money calculations, pickup-slot validator, order number generator, and order-policy ownership/transition checks.
- [ ] Integration with isolated database: create-order success, inactive product rejection, price tampering, ownership, invalid store/slot, transaction rollback, and idempotency replay.
- [ ] Browser: list/detail add to cart, cart update/removal, login return-to-cart, checkout confirmation, duplicate-click prevention, and mobile cart layout.

**Staging checklist**

- [ ] Run migration and seed in staging.
- [ ] Create a customer test order from a clean browser profile.
- [ ] Confirm stored totals/order items/store/pickup time match the confirmation.
- [ ] Repeat the same request/key and confirm no second order exists.
- [ ] Verify active/inactive products, closed stores, and invalid pickup slots reject cleanly.
- [ ] Monitor order creation failures, idempotency replays, and authorization denials.

**Exit gate:** The customer ordering beta passes automated tests and a staging end-to-end rehearsal.

## File-level implementation map

| Area | Expected changes |
| --- | --- |
| Prisma schema/migrations | Durable order fields, idempotency, store pickup rules, indexes. |
| `prisma/seed.ts` | Active locations and order fixtures. |
| `lib/store/useCart.ts` | Normalized cart actions and derived selectors. |
| `components/Home/componenets/Header.tsx` | Live cart count. |
| `components/menu/MenuItems.tsx` | Real cart action, no toast-only fake add. |
| `app/(public)/menu/[productId]/page.tsx` | Shared cart behavior; remove/model modifiers. |
| `app/(public)/cart/page.tsx` | Complete client cart experience. |
| New checkout/order routes | Customer checkout and confirmation views. |
| New order service/validation module | Transactional creation, totals, slots, idempotency. |
| Public product APIs | Active-only, validated catalogue/detail queries. |
| Tests/CI scripts | Unit, integration, and browser coverage. |

## Dependency order

`B0 → B1 → (B2 + B6) → B3 → B4 → B5 → B7`

Cart work and public product hardening can proceed in parallel after the order contract is approved. Checkout UI must wait for the server order service. Staff queues, payment cards, delivery, refunds, and customer order history beyond confirmation remain Phase C/Phase D work.

## Phase B sign-off checklist

- [ ] Product/payment/fulfilment/tax/store decisions approved.
- [ ] Migration and deterministic store seed succeed.
- [ ] One cart model powers list, detail, header, and cart page.
- [ ] Public product reads are active-only.
- [ ] Order creation is authenticated, validated, transactional, and idempotent.
- [ ] Server totals override client data.
- [ ] Checkout clears the cart only after confirmation.
- [ ] Order confirmation has ownership protection.
- [ ] Automated and staging ordering tests pass.

