# Phase D — Customer Account and Order Tracking Implementation Plan

**Priority:** P2–P4  
**Objective:** Let authenticated customers manage their account and safely view, track, and cancel only their own pickup orders.

## Starting point and scope

Phase B provides authenticated, pickup-only, pay-at-pickup orders in ETB. Phase C provides server-authorized staff transitions and audit records. The new `/dashboard/profile` page already covers basic profile and password changes; Phase D completes the customer-facing post-checkout experience around it.

In scope: account summary, order history/detail, status tracking, policy-controlled cancellation, empty/error states, and customer-safe order data. Email/SMS/push notifications are excluded until a provider and consent policy are approved.

## Definition of done

1. A customer can view a concise account summary and their own active/recent orders.
2. Every customer order query and mutation is server-authorized by ownership; guessed IDs reveal nothing.
3. Order status is understandable in Ethiopia local time and uses the real lifecycle.
4. Cancellation is possible only inside the existing `canCancelOrder` policy and is audit-logged.
5. Customer data and staff-only details are minimized in every response.

## D0 — Confirm contracts and policies

- [ ] Confirm whether the existing 30-minute cancellation window is final and whether pickup-time proximity adds another cutoff.
- [ ] Define customer-visible labels for all statuses and the cancellation result, including payment-at-pickup wording.
- [ ] Confirm receipt notification channel, consent, sender identity, retries, and failure handling before adding notifications.
- [ ] Define pagination (recommended: 20 orders/page), default ordering (newest first), and whether cancelled orders are included by default.
- [ ] Document a customer-safe order projection: number, status, pickup time/store, item snapshots, ETB totals, payment method/status, notes, and dates. Exclude staff assignments, audit internals, and privileged customer data.

**Exit gate:** Every page/action has an ownership rule, projection, and failure behavior.

## D1 — Customer order service

**Files:** `lib/orders/customer-service.ts`, `lib/order-policy.ts`, tests.

- [ ] Add server-only `listCustomerOrders(actor, filters)` with bounded pagination and user ID derived from the session.
- [ ] Add `getCustomerOrder(actor, orderId)` using `canReadOrder`; return not-found for unowned IDs.
- [ ] Add `cancelCustomerOrder(actor, orderId)` in a transaction: load current order, call `canCancelOrder`, update to `CANCELLED`, set payment status to `VOID` only when appropriate, and write an audit event.
- [ ] Reuse order snapshots (`OrderItem.price`, total, VAT) rather than current catalogue prices.
- [ ] Return only explicit client-safe DTOs. Do not serialize Prisma records directly.

**Acceptance checks**

- [ ] Customer A cannot list, read, or cancel Customer B's order.
- [ ] Repeated/stale cancellation attempts do not alter terminal orders.
- [ ] All displayed totals remain ETB snapshots and include the persisted 15% VAT amount.

## D2 — Account summary and history UI

**Files:** `app/(protected)/dashboard/(grouped)/profile/**`, `components/dashboard/customer/**`.

- [ ] Extend Profile with an account summary: active order count, latest pickup, and direct action to history.
- [ ] Add `/dashboard/orders` as the canonical customer history route; retain any legacy user route as a redirect only.
- [ ] Build responsive order cards/table with number, current status, local pickup time, store, item count, and ETB total.
- [ ] Add filters for active/completed/cancelled and accessible pagination controls.
- [ ] Add loading, empty, denied, and retry states. Maintain 44px targets, visible keyboard focus, and status text in addition to color.

**Exit gate:** Customers can find their orders from profile and accurately understand their current state.

## D3 — Order detail, tracking, and cancellation

**Files:** `app/(protected)/dashboard/orders/[orderId]/page.tsx`, customer components, protected route/action or API handler.

- [ ] Consolidate the post-checkout confirmation and authenticated tracking/detail experience around one ownership-checked service.
- [ ] Render a status timeline: Pending, Confirmed, Preparing, Ready for pickup, Completed; show Cancelled as terminal.
- [ ] Use `StoreLocation.timezone` (`Africa/Addis_Ababa` for the current store) for pickup and event times.
- [ ] Show pickup location, payment-at-pickup instructions, line-item snapshots, subtotal, VAT (15%), and ETB total.
- [ ] Render Cancel only when the server reports eligibility; confirm intent before submission, display result/error accessibly, then refresh the order.
- [ ] Do not expose staff queue data, audit events, or another user’s information.

**Exit gate:** A customer can track and, when eligible, cancel their order without a staff intervention.

## D4 — Navigation, route compatibility, and authorization

- [ ] Add an **Orders** link to the customer workspace sidebar; do not show it as a substitute for staff queue links.
- [ ] Route `/dashboard/user` to `/dashboard/profile` or `/dashboard/orders` intentionally and preserve deep-link safety.
- [ ] Ensure direct `/dashboard/orders/*` visits require a session and ownership checks on the server.
- [ ] Keep staff/admin order pages separate from customer projections and APIs.

## D5 — Test and stage

- [ ] Unit-test lifecycle labels, cancellation boundaries, customer DTO mapping, and Ethiopia-time formatting.
- [ ] Integration-test owned/unowned detail, list pagination, allowed cancellation, terminal/stale denial, and audit record creation.
- [ ] Browser-test profile → orders → detail → cancel at mobile/tablet/desktop widths.
- [ ] Seed multiple users and orders in each status; verify each user sees only their own history.
- [ ] Run a staging rehearsal with a real staff transition from pending to ready and confirm the customer view updates after refresh.

## Delivery order

`D0 contracts → D1 customer service → D2 history UI → D3 detail/cancellation → D4 navigation → D5 test/stage`

Notifications, saved preferences beyond the current profile fields, delivery, refunds, and payment providers remain separate follow-on work.

## Phase D sign-off checklist

- [ ] Customer routes are authenticated and ownership-checked.
- [ ] History and detail use order snapshots and ETB/VAT values.
- [ ] Status tracking reflects staff-authoritative changes.
- [ ] Cancellation is policy-controlled, transactional, and audited.
- [ ] Profile, history, and detail work at phone, tablet, and desktop widths.
- [ ] Notification scope is approved before any external messaging is implemented.
