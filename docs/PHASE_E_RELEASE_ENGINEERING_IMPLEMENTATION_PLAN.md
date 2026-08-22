# Phase E — Release Engineering Implementation Plan

**Priority:** P5, continuous and final release gate  
**Objective:** Make K-Coffee reproducible, testable, observable, and safe to deploy before production launch.

## Scope and definition of done

Phase E validates the completed pickup-only, pay-at-pickup ordering system: authentication, customer orders, cashier fulfilment, admin operations, and superadmin controls. It does not add delivery, online payments, notifications, or new customer features.

Definition of done:

1. CI reliably runs lint, typecheck, tests, and build from a clean checkout.
2. Critical customer, cashier, admin, and superadmin journeys have automated coverage.
3. Staging migrations, seeded role rehearsal, backups, monitoring, and rollback runbooks are verified.
4. No known high-severity security, accessibility, or data-integrity issue remains.

## E0 — Establish the quality baseline

- [ ] Inventory current commands and classify expected failures. The repository-wide lint must exclude `.agents`, generated output, and vendor/tool folders rather than ignore application errors.
- [ ] Add `typecheck`, `test:unit`, `test:integration`, `test:e2e`, and `ci` scripts with deterministic exit codes.
- [ ] Choose test runners compatible with Next 16 and the Prisma/Postgres stack; document Node and package-manager versions.
- [ ] Add `.env.example` containing variable names only, with safe local defaults and no credentials.
- [ ] Make a clear distinction between development seed data and production configuration.

**Exit gate:** A fresh developer can install dependencies, configure a local environment, and run the same checks as CI.

## E1 — Unit and policy tests

**Coverage targets:**

- [ ] Cart reducers: merge, quantity bounds, persistence sanitization, and subtotal calculation.
- [ ] ETB/VAT calculation and server-authoritative totals.
- [ ] Pickup slot generation/validation in `Africa/Addis_Ababa`, 20-minute intervals, operating-hour boundaries, capacity, and lead time.
- [ ] Order-number uniqueness behavior and idempotency replay.
- [ ] `canReadOrder`, `canCancelOrder`, and `canTransitionOrder`, including terminal and cross-store cases.
- [ ] RBAC matrix, permission synchronization, and last-superadmin guard.
- [ ] Customer-safe order DTO/status-label mapping.

Use fixed clocks in all time-sensitive tests. Do not call a real database for pure policy tests.

## E2 — Integration and data-integrity tests

- [ ] Provision an isolated disposable PostgreSQL database for integration tests.
- [ ] Apply migrations in order; verify the upgrade path from the pre-order schema through staff-store assignment.
- [ ] Test authenticated order creation, inactive product/store rejection, slot capacity, idempotency, and rollback on failure.
- [ ] Test ownership isolation for customer order list/detail/cancel APIs.
- [ ] Test cashier store scoping and status transition audit records.
- [ ] Test admin archive/restore, superadmin role changes, and store assignment validation.
- [ ] Assert that denied requests do not mutate data and return safe errors.

**Exit gate:** Order, role, and audit mutations are transactionally verified against the real database engine.

## E3 — Browser, responsive, and accessibility tests

Use Playwright for authenticated role fixtures and critical paths:

- [ ] Register/login/logout and profile/password feedback.
- [ ] Cart quantity updates, authenticated checkout, ETB/VAT review, and confirmation.
- [ ] Customer history, tracking detail, and allowed/denied cancellation.
- [ ] Cashier queue and valid status progression.
- [ ] Admin catalogue archive/restore; superadmin staff role/store access and audit view.
- [ ] Denied direct URL/API attempts for every role boundary.

Review at 320, 375, 414, 768, 1024, and 1440 px. Verify keyboard traversal, focus visibility, labels, error announcements, contrast, reduced motion, and no horizontal overflow.

## E4 — Performance, resilience, and security hardening

- [ ] Use `next/image` or approved remote-image patterns for product assets; reserve dimensions and fallback states.
- [ ] Add route-level loading, error, and not-found boundaries for storefront, dashboard, and order detail routes.
- [ ] Ensure API errors are logged with request context but never expose stack traces, secrets, or other-user data.
- [ ] Add request-size limits, input validation, and practical rate limits to public/authenticated mutation endpoints.
- [ ] Review auth cookie settings, production trusted origins, CSP, and environment-variable validation.
- [ ] Run dependency/security audit and document accepted risks/remediation dates.

## E5 — CI, staging, and operational readiness

- [ ] Add CI workflow: install → Prisma generate → lint → typecheck → unit/integration tests → build → Playwright critical tests.
- [ ] Ensure production build does not rely on fetching remote fonts or unseeded local data.
- [ ] Define staging migration deploy command and prohibit development seed fixtures in production.
- [ ] Configure managed PostgreSQL backups, restore test cadence, and retention owner.
- [ ] Configure error tracking, uptime checks for home/auth/protected health, and database alerting.
- [ ] Write runbooks for rollback, migration failure, failed order creation, account access, store outage, and data restore.
- [ ] Perform a staging rehearsal with customer, cashier, admin, and superadmin accounts across at least two stores.

## E6 — Final release gate

- [ ] All CI checks pass on a clean commit.
- [ ] All migrations apply cleanly to a staging copy and rollback/restore has evidence.
- [ ] Role-based rehearsal completes from order creation through pickup completion and customer tracking.
- [ ] Placeholder branch address/phone and development credentials are replaced or removed.
- [ ] Security, accessibility, performance, and operational owners sign off.

## Delivery order

`E0 baseline → E1 unit tests → E2 integration tests → E3 browser/a11y → E4 hardening → E5 staging/CI → E6 release gate`

Phase E begins immediately and continues during final feature fixes; E6 must pass before production deployment.
