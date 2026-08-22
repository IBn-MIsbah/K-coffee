# Production Readiness Remediation Plan

**Source:** `PRODUCTION_READINESS_TEST_REPORT_2026-08-22.md`  
**Goal:** Remove every production blocker and collect reproducible release evidence.

## Priority order

| Priority | Workstream | Blocking reason | Completion evidence |
| --- | --- | --- | --- |
| P0 | Build independence | A production build currently fails when Google Fonts cannot be reached. | Clean `npm run build` with networking disabled after dependencies are installed. |
| P0 | Migration diagnosis | Database schema state cannot be checked or safely promoted. | `prisma migrate status` and `migrate deploy` pass against disposable staging DB. |
| P1 | Automated coverage/CI | Regressions can reach production without integration or browser gates. | CI proves unit, integration, build, and critical browser tests. |
| P1 | Dependency/security review | High-severity findings are untriaged. | Networked audit report and remediation/accepted-risk record. |
| P1 | Operational readiness | No backup, monitoring, or rollback proof exists. | Staging rehearsal and owner-approved runbooks. |

## R0 — Make the production build network-independent

1. Locate every `next/font/google` import, starting with Inter.
2. Replace remote runtime/build font fetching with an approved local asset via `next/font/local`, or use a system-font stack if a licensed local file is unavailable.
3. Preserve typography tokens and test the public/auth/dashboard layouts for wrapping and contrast changes.
4. Run `npm run build` with external network unavailable.
5. Add the build command to CI only after it passes locally.

**Do not:** merely depend on CI internet access; that leaves deploys fragile.

## R1 — Diagnose and repair migration readiness

1. Record PostgreSQL service/version, `DATABASE_URL` host/port reachability, and Prisma versions without exposing credentials.
2. Run `prisma db pull`/connection diagnostics only against a disposable local or staging database; do not point exploratory commands at production.
3. Capture the full schema-engine error with safe diagnostic logging. Confirm database user permissions for schema and migration tables.
4. Create a fresh test database, run `prisma migrate deploy`, then `prisma migrate status`.
5. Seed only test fixtures and execute ordering/staff smoke flows.
6. Verify migration history includes pickup checkout and `StaffStoreAssignment` in the intended order. Resolve drift with a reviewed migration; never edit an applied migration.
7. Document the staging migration command and rollback/restore procedure.

**Exit gate:** fresh DB deploy, status, seed, and test suite all pass with captured output.

## R2 — Close dependency-audit uncertainty

1. Run `npm audit --omit=dev --audit-level=high` from a networked CI runner.
2. Export the report and map each finding to direct/transitive dependency, exploitability, and affected runtime path.
3. Upgrade compatible dependencies with lockfile review; run `npm run check`, unit tests, and production build after every update.
4. For a non-remediable issue, document compensating controls, expiry date, and owner. Do not use `--force` without a compatibility review.
5. Add audit to CI as report-only first, then enforce a reviewed severity threshold.

## R3 — Build the test pyramid

### Unit

- Expand current Vitest suite: cart mutation limits/persistence, VAT/slot math, idempotency, RBAC matrix, status transitions, and last-superadmin protection.
- Freeze clocks for Ethiopia-time tests.

### Integration

- Add disposable PostgreSQL provisioning to CI.
- Test migrations, authenticated order creation, cancellation, cross-user denial, cashier cross-store denial, audit records, and transaction rollback.
- Reset DB between suites; never reuse developer or production data.

### Browser

- Add Playwright project/configuration and authenticated fixtures.
- Cover login/logout, cart/checkout, customer tracking/cancellation, cashier fulfilment, admin archive, superadmin staff assignment, and denied URLs.
- Run critical flows at 375, 768, and 1440 px in CI; retain traces/screenshots on failure.

**Exit gate:** required tests run in CI from a clean checkout and failures produce useful artifacts.

## R4 — Resilience, accessibility, and security checks

1. Add loading, error, and not-found boundaries for storefront, dashboard, checkout, and order details.
2. Replace raw product images with `next/image` or reviewed remote patterns; set dimensions and fallbacks.
3. Add request-size limits, consistent validation, and rate limits to mutation endpoints.
4. Verify CSP, trusted origins, secure cookie settings, production `BETTER_AUTH_URL`, and environment validation.
5. Run manual keyboard, focus, error announcement, contrast, reduced-motion, and 320–1440 px checks; convert critical defects into automated tests.

## R5 — Operations and release rehearsal

1. Replace placeholder store address/phone and remove/rotate development credentials before any production seed/deploy.
2. Choose managed PostgreSQL, configure backups, test restore into an isolated database, and name an owner/retention schedule.
3. Configure error tracking, uptime checks, database alerts, and audit-log retention.
4. Write runbooks: rollback, migration failure, failed order creation, account recovery, store outage, and data restore.
5. Rehearse staging with customer, cashier, admin, and superadmin accounts across two stores: order → fulfilment → customer tracking/cancellation policy → audit review.
6. Hold release approval only when every artifact above is attached to the release record.

## Recommended delivery sequence

`R0 build fix → R1 disposable migration proof → R2 audit → R3 tests/CI → R4 hardening → R5 staging rehearsal → release approval`

## Explicit blockers requiring external authority

- Production font licensing/asset source, if no approved local font asset exists.
- Database hosting, backup, monitoring, error-tracking, and notification provider selection.
- Real store address, phone, operating details, and decision on removing development users.
- Networked CI credentials/registry access needed for dependency audit and browser infrastructure.
