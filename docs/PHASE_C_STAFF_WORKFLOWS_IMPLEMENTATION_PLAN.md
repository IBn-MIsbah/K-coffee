# Phase C — Staff Workflows Implementation Plan

**Priority:** P2–P3  
**Objective:** Give cashiers and administrators secure, practical workflows to fulfil orders and maintain the menu/store configuration without direct database access.

## Prerequisites and scope boundary

Phase C cannot become operational until Phase B delivers real orders, active stores, server-authoritative totals, pickup times, and order status records. The current admin, cashier, and user dashboard pages are placeholders; building visual dashboards before that data exists would create non-functional UI.

Phase C starts after all of these Phase B conditions are true:

- [ ] An authenticated customer can create an idempotent order against an active store.
- [ ] Orders store status, pickup time, totals, items, customer ownership, and store ID.
- [ ] Store locations have real operating data and staff scope can be determined.
- [ ] Order reads use Phase A ownership/authorization policy helpers.
- [ ] The Phase B staging ordering rehearsal passes.

## Definition of done

1. Cashiers see only their authorized store queue and can make only permitted status transitions.
2. Admins can view operational metrics and create, edit, and archive catalogue/categories/store locations.
3. Superadmins can safely manage staff roles without self-lockout or loss of the last superadmin.
4. Every mutation is server-authorized, validated, transactional where required, and audit-logged.
5. Dashboard navigation contains only real, permitted destinations.
6. Staff workflows are tested at desktop and tablet breakpoints with denied-path coverage.

## Policy decisions required before implementation

| Decision | Required outcome |
| --- | --- |
| Cashier store assignment | Add explicit staff-to-store relation or choose a temporary single-store policy. Do not infer store access from role alone. |
| Order transition policy | Confirm which roles may move each status, cancellation/refund authority, and whether admins can override. |
| Order visibility | Confirm whether cashiers see customer name/contact, only pickup name, or a minimized contact snapshot. |
| Catalogue lifecycle | Confirm archive/restore policy and whether price/category changes affect only future orders. |
| Store management | Confirm who can activate/deactivate a store and how active orders are handled when it is disabled. |
| Role management | Confirm whether admins can manage cashiers or only superadmins can change every staff role. |
| Reporting | Confirm currency/timezone and whether sales metrics exclude cancelled/unpaid orders. |

## Guardrails

- Dashboard routes are not sufficient protection; every query and mutation must use Phase A `requireRole`/`requirePermission` helpers.
- A cashier must never gain cross-store access because a URL or browser payload contains a different `storeId`.
- Do not hard-delete products, categories, stores, users, or records referenced by orders/audit logs.
- Status changes must read the current order in a transaction, validate a central transition rule, update once, and write an audit event.
- Metrics must use server-calculated order snapshots, not current product prices or browser data.
- Do not show customer data that the assigned staff role does not require to fulfil the order.

## Task sequence

### C0 — Define staff scope, route map, and data contracts

- [ ] Approve the policy decisions above.
- [ ] Replace the current sidebar route assumptions (`/order`, `/customers`, `/staff`, `/settings`) with the final route map.
- [ ] Define server input/output contracts for order queue/filter, order detail, status update, product/category/store mutation, metric query, and staff role mutation.
- [ ] Add staff/store assignment to the schema if multi-store work is in scope. A simple v1 approach is a join model between `User` and `StoreLocation` with a unique `(userId, storeId)` constraint.
- [ ] Define a data-minimization projection for cashier order queries.

**Exit gate:** Every staff page/action has an approved role, store-scope rule, and server contract.

### C1 — Build the order operations service

**Files:** new `lib/orders/staff-service.ts`, `lib/order-policy.ts`, schema migration if staff-store scope is added, tests.

- [ ] Build a server-only staff queue query accepting validated status, pickup time, search, and pagination inputs.
- [ ] Load the actor first; derive authorized store IDs on the server.
- [ ] Filter orders by authorized store IDs for cashier access; admins/superadmins follow approved policy.
- [ ] Build `getStaffOrderDetail(orderId)` with a minimized customer projection.
- [ ] Build `transitionOrderStatus({ orderId, nextStatus })`:
  - [ ] fetch current order inside a transaction;
  - [ ] call `canTransitionOrder` with the verified actor/store context;
  - [ ] reject stale/terminal/disallowed transitions;
  - [ ] set the new status and matching timestamp;
  - [ ] create an audit entry containing before/after status and actor/store;
  - [ ] return a client-safe updated summary.
- [ ] Add optional optimistic-concurrency protection (`updatedAt` or version field) if several cashiers may work on the same queue.

**Acceptance checks**

- [ ] A cashier cannot list/read/change an order outside assigned stores.
- [ ] A cashier cannot skip transitions or alter completed/cancelled orders.
- [ ] An admin override follows the explicit approved policy and is audited.
- [ ] Queue filtering/pagination cannot broaden the staff member’s scope.

### C2 — Implement the cashier workspace

**Files:** `app/(protected)/dashboard/(grouped)/cashier/**`, dedicated components under `components/dashboard/cashier/**`.

- [ ] Replace the placeholder cashier page with a queue grouped or filterable by `PENDING`, `CONFIRMED`, `PREPARING`, and `READY_FOR_PICKUP`.
- [ ] Show order number, pickup time, status, item count, and only the approved customer context.
- [ ] Add filter controls for status, pickup time, search/order number, and assigned store where applicable.
- [ ] Add a detail panel/page showing item snapshots, approved notes, and status history.
- [ ] Render only enabled next-status actions returned by the server policy; never construct buttons solely from a client enum.
- [ ] Provide clear pending/success/error feedback and refresh/reconcile queue state after a mutation.
- [ ] Support keyboard operation, 44px targets, visible focus, clear status text/icons, and a responsive tablet layout.
- [ ] Add an empty state for no current orders and an error/retry state for failed loading.

**Exit gate:** A cashier can process only scoped, valid orders through the approved lifecycle.

### C3 — Implement admin operations and metrics

**Files:** `app/(protected)/dashboard/(grouped)/admin/**`, `components/dashboard/admin/**`, new server services/actions.

- [ ] Replace the admin placeholder with operational summaries: orders by status, sales total, average preparation time, and recent audited activity.
- [ ] Define metric date range/timezone and exclusion rules before implementation.
- [ ] Implement product management:
  - [ ] create/edit with server validation for name, Decimal price, category, image URL, and active state;
  - [ ] use the Phase A secure upload action only after validated product draft/create flow;
  - [ ] archive/restore instead of delete when referenced by orders;
  - [ ] audit create/update/archive operations.
- [ ] Implement category management with slug uniqueness, no deletion while products require the category, and audited changes.
- [ ] Implement store-location management with validated address, phone, timezone, hours, active state, and pickup policy. Block unsafe deactivation if upcoming orders exist unless an approved reassignment/cancellation flow runs.
- [ ] Add accessible table/card views, search/filter, empty states, confirm dialogs for destructive actions, and server-rendered pagination.

**Exit gate:** An admin can maintain current catalogue and locations, see trustworthy operational data, and all mutations are audit-logged.

### C4 — Implement superadmin staff and audit operations

**Files:** superadmin-only routes/components, `lib/staff-service.ts`, `lib/audit-service.ts`, schema migration if needed.

- [ ] Add a superadmin-only staff directory with role, active status, allowed stores, and account metadata that is appropriate to expose.
- [ ] Implement role assignment/removal server action with validation against the `UserRole` enum.
- [ ] Prevent the actor from removing their own final superadmin role; prevent the system from having zero superadmins.
- [ ] Audit every role and store-assignment mutation with subject, previous values, new values, actor, and time.
- [ ] Add a protected audit-log viewer with pagination, date/action/resource/actor filters, and data minimization.
- [ ] Do not make password, verification token, session token, full payment, or secret data visible in the audit UI.

**Exit gate:** Only superadmins can alter staff roles; role changes cannot lock out all superadmins and are traceable.

### C5 — Align navigation and authorization with actual operations

**Files:** `components/DashboardGrouped/AppSidebar.tsx`, dashboard layouts/routes, authz/RBAC tests.

- [ ] Replace placeholder sidebar links with working role-specific destinations.
- [ ] Make active state match the real nested dashboard routes.
- [ ] Preserve Phase A server role layouts and add `requirePermission` to every action/query service.
- [ ] Use server-derived permission capabilities for UI affordances; treat hidden controls as UX, not security.
- [ ] Add safe unauthorized/not-found/error states to new dashboard routes.
- [ ] Ensure direct URL visits and API/action calls are denied consistently, even if a stale client renders a link.

**Exit gate:** Every visible staff navigation item resolves to a permitted, implemented workflow.

### C6 — Test and stage the staff beta

**Automated tests**

- [ ] Unit: transition matrix, staff-store scope, metric calculations, archive/deactivation rules, last-superadmin protection.
- [ ] Integration: cashier scoped queue, status mutation/audit record, admin product/store mutation, role change denial/approval, audit filtering.
- [ ] Browser: cashier order fulfilment, denied cross-role route/action, product archive, store deactivation safeguard, superadmin role change, 768px and desktop dashboard layouts.

**Staging rehearsal**

- [ ] Seed at least two stores, two cashiers with different assignments, an admin, superadmin, and orders across statuses.
- [ ] Verify each cashier sees only their store’s queue.
- [ ] Complete a representative lifecycle from `PENDING` to `COMPLETED`.
- [ ] Confirm admin metric totals against seeded order snapshots.
- [ ] Confirm all staff mutations produce readable audit events.
- [ ] Verify denied actions return safe errors and do not mutate data.

**Exit gate:** The staff beta passes a real role/store rehearsal with audit evidence and no authorization escape path.

## File-level implementation map

| Area | Expected changes |
| --- | --- |
| Prisma schema/migrations | Staff-store assignment, order status timestamps/concurrency fields, operational indexes where approved. |
| `lib/order-policy.ts` | Final role/store-aware transition policy. |
| New staff/order services | Scoped queue/detail/status mutations with transactions and audit entries. |
| Cashier dashboard | Queue, filters, detail, status actions, responsive staff UI. |
| Admin dashboard | Metrics, catalogue/category/store management, audit viewer. |
| Superadmin routes | Staff role/store assignment management and safeguards. |
| `AppSidebar.tsx` | Real permitted routes only. |
| Tests | Unit, integration, and browser role/store workflow coverage. |

## Dependency order

`Phase B order domain → C0 → C1 → (C2 + C3) → C4 → C5 → C6`

Cashier and admin UI may be developed in parallel only after the scoped order service and data contracts in C1 are stable. Superadmin staff management must follow the final role/store policy. Phase D customer account/history views should reuse the finalized order detail/ownership service rather than reimplement queries.

## Phase C sign-off checklist

- [ ] Phase B order data and store scope are available.
- [ ] Cashier store assignment and order transition policy are approved.
- [ ] Cashier queues are server-scoped and transition-safe.
- [ ] Admin catalogue/category/store operations are validated and audit-logged.
- [ ] Superadmin role changes preserve at least one superadmin.
- [ ] Dashboard navigation contains no dead/unpermitted links.
- [ ] Role/store authorization is covered by tests.
- [ ] Staging staff rehearsal passes with audit evidence.

