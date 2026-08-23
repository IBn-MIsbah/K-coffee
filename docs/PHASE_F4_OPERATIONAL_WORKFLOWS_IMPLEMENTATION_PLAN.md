# Phase F4 — Customer and Staff Operational Workflows

**Parent:** `FEATURE_AND_ACCESS_REMEDIATION_PLAN.md`  
**Priority:** P1  
**Goal:** Complete the day-to-day customer-support, pickup fulfilment, administration, and superadmin workflows while preserving authenticated-only, pickup-only, pay-at-pickup ordering.

## Preconditions

- Close and commit the remaining F3 browser-role evidence before merging F4 feature work.
- Use the existing operational policy: ETB, 15% VAT, 20-minute pickup slots, and `Africa/Addis_Ababa` reporting/operating time.
- Retain order-price snapshots; never recompute completed-order prices from the current catalogue.
- All pages, route handlers, server actions, exports, and mutations require server-side authorization before their UI is built.
- Do not implement refunds, online payment capture, notifications, or staff invitations until the relevant owner decisions below are approved.

## Decisions required before implementation

| Decision | Required for | Owner |
| --- | --- | --- |
| Notification channel/provider, sender identity, consent, retention, and failure handling | F4.2 | Product/privacy owner |
| Cancellation window and permitted staff exception/cancellation states | F4.1 | Operations owner |
| Order export fields, recipients, retention, and download authorization | F4.3 | Operations/privacy owner |
| Staff invitation identity-verification and offboarding policy | F4.5 | Superadmin/operations owner |
| Audit retention and export policy | F4.6 | Privacy/operations owner |

## F4.0 — Define operational contracts and permissions

1. Inventory current order status transitions, staff store scope, cancellation handling, order-detail ownership checks, and audit actions.
2. Document the allowed state transition matrix. At minimum, define permitted transitions among `PENDING`, `CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `COMPLETED`, and `CANCELLED`.
3. Separate customer actions from staff actions:
   - customers may view only their orders and may request/cancel only within approved policy;
   - cashiers may view and transition orders only for assigned active stores;
   - admins may view operations per their permission matrix but cannot perform superadmin staff/audit operations;
   - superadmins retain global staff-assignment administration.
4. Define audit vocabulary and safe details for status changes, exception reasons, support requests, exports, invitations, assignments, and offboarding. Never include passwords, tokens, or unredacted payment data.
5. Add authorization tests for every proposed action before adding the action UI.

**Exit criterion:** The transition, scope, ownership, retention, and audit contracts are written in code-adjacent documentation and agreed by the operations owner.

## F4.1 — Complete order detail, support, and fulfilment workflows

1. Create a shared order-detail service that selects only the data appropriate to the actor and enforces order ownership/store scope in the query itself.
2. Add a customer order-help action on an owned order detail page:
   - prefill a non-sensitive order number;
   - offer approved contact/support channel(s);
   - do not expose other customer identity, notes, or internal staff data;
   - audit support-request creation if a persisted workflow is approved.
3. Add a staff order-detail page with order number, items, quantities, price snapshots, customer-safe pickup name, pickup time in store-local time, notes, payment status, and an audit timeline.
4. Add permitted status transition controls with a confirmation step for cancellation/exception actions, inline validation errors, and Sonner toast outcome feedback.
5. Enforce assigned-store scope both in the page data and the mutation endpoint. Return JSON `401`/`403` for APIs and safe page redirects for denied UI routes.
6. Make cancellation explicit for pay-at-pickup: record the cancellation reason/action, mark payment state appropriately, and do not create refund logic unless payment policy changes.

**Verification:** customer cross-order access returns not-found/safe denial; cashier cross-store status changes return `403`; every successful transition writes exactly one audit event.

## F4.2 — Add notification delivery only after provider approval

1. Select a transactional provider and configure production credentials outside source control.
2. Add a notification delivery model only if persistence/retry reporting is approved: order ID, event type, destination category, provider message ID, attempt count, status, timestamps, and safe error classification.
3. Trigger notifications after the order transaction commits; notification failure must never roll back a valid order or status transition.
4. Implement the approved events: received, confirmed, ready for pickup, cancelled, and store exception.
5. Add idempotency/deduplication per order-event-recipient so retries do not resend unexpectedly.
6. Provide staff-visible delivery status only when it is operationally useful and does not expose contact data unnecessarily.
7. Test provider failures, duplicate events, invalid destinations, and successful delivery recording with a fake transport.

**Exit criterion:** Notification delivery is observable, idempotent, and non-blocking; it is omitted entirely if approval is not received.

## F4.3 — Expand administrator order operations and reporting

1. Add server-validated list filters for date range, store, status, and search by exact order number/customer-safe identifier.
2. Apply pagination with deterministic ordering and bounded page sizes; do not load unbounded order history into the dashboard.
3. Define all reporting dates and aggregates in `Africa/Addis_Ababa`; label totals as operational metrics, not accounting reconciliation.
4. Add an operational dashboard with clear empty/loading/error states, semantic headings, keyboard-accessible filter controls, and ETB/tabular currency values.
5. Add CSV export only after the approved export contract exists. Restrict it server-side, log each export, apply field minimization, and use short-lived/download-safe responses.
6. Test filters, pagination boundaries, timezone cutovers, export authorization, and audit records.

**Exit criterion:** Authorized staff can locate and review operational orders efficiently without broad data exposure or misleading financial claims.

## F4.4 — Improve the customer order journey

1. Add an owned order-detail view with clear pickup location, local pickup time, order status, items, totals, payment-at-pickup note, and cancellation/support availability.
2. Add customer order-history filters appropriate to the small account context: active/completed/cancelled and bounded date range if needed.
3. Show a clear empty state, authenticated login intent when necessary, and safe not-found state for unowned IDs.
4. Keep all customer-facing status text understandable; do not expose internal exception codes or staff-only timeline entries.
5. Add responsive tests at 375, 768, and 1440 pixels for the order detail and support action.

## F4.5 — Complete staff lifecycle administration

1. Define the invitation path: invite email, activation expiry, one-time acceptance, first-password setup, and the responsible superadmin.
2. Add staff activation/deactivation/offboarding state without deleting historical order/audit references.
3. Add a last-superadmin protection rule in service and API layers: no role change, deactivation, or removal may leave the system without an active superadmin.
4. Preserve staff/store assignment history with actor, reason, effective time, and audit event; do not overwrite history silently.
5. Limit all staff identity/role/store assignment mutation to `SUPERADMIN` and verify server-side on every endpoint.
6. Test invitation expiry, repeated use, role changes, offboarding, store-scope changes, and last-superadmin protection.

**Exit criterion:** Superadmins can onboard, scope, and offboard staff without direct database changes or loss of operational accountability.

## F4.6 — Make audit operations usable and governed

1. Add query filters for actor, role, resource, action, store scope when applicable, and Ethiopia-local date range.
2. Paginate audit results with stable ordering; preserve immutable event identifiers and timestamps.
3. Add exports only after retention/access policy approval. Export itself must be audited.
4. Provide a clear read-only audit-detail view with safe, human-readable details and no secret/token fields.
5. Add retention/archival documentation and an operational access-review cadence.

## F4.7 — Test, CI, and release gates

1. Add unit tests for status transition legality, cancellation policy, reporting timezone boundaries, export schema validation, and last-superadmin rules.
2. Add PostgreSQL integration tests for ownership, cashier store scope, status/audit atomicity, notification idempotency (if approved), pagination, and offboarding.
3. Add Playwright role fixtures and flows for customer support/order tracking, cashier fulfilment, admin filtering, superadmin lifecycle, and denied URLs at 375/768/1440.
4. Run `npm run content:check`, `npm run check`, `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, `npx prisma migrate status` on the disposable database, and `npm run build` in CI.
5. Commit in dependency order: schema/migration → service/API → UI → tests/CI/docs.

## Recommended implementation order

`F4.0 contracts → F4.1 staff/customer order detail → F4.3 filtered operations → F4.4 customer journey → F4.5 staff lifecycle → F4.6 audit operations → F4.2 notifications (after approval) → F4.7 release gates`

## Acceptance gate

Phase F4 is complete only when customer support, cashier fulfilment, administration, and superadmin lifecycle tasks can be completed through authorized, audited, responsive workflows; the required policies are approved; and unit, integration, browser, and CI evidence passes against a disposable PostgreSQL environment.
