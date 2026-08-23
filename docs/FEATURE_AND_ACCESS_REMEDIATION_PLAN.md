# Feature and access remediation plan

**Sources:** `MISSING_PAGES_AND_FEATURES.md`, `AUTHENTICATION_AND_LOGIN_REDIRECT_POLICY.md`, and `PRODUCTION_READINESS_REMEDIATION_PLAN.md`  
**Objective:** Complete the missing customer, staff, public-content, authentication, and release capabilities without weakening the existing authenticated pickup-only ordering model.

## Scope and sequencing rules

- Retain the approved v1 commerce policy: authenticated-only, pickup-only, pay-at-pickup, ETB, 15% VAT, 20-minute pickup intervals, and Ethiopia-local store hours.
- Protect every new page, route handler, and server action at the server boundary before building its UI.
- Finish all P0 items and their automated coverage before launching new commercial features such as modifiers, promotions, or reservations.
- Do not publish placeholder public pages, development credentials, or unapproved store/legal information.
- Each phase ends with a deployable, tested increment; database changes must use new reviewed Prisma migrations.

## Phase F0 — correct routes and preserve login intent

**Goal:** Remove broken/duplicate journeys and make the login return path reliable.

1. Add a request-aware protected-route helper that derives an internal `returnTo` from the requested pathname and approved query parameters.
2. Keep `safeReturnTo` fail-closed: accept only same-site paths; reject schemes, `//`, malformed paths, and unapproved query keys.
3. Update the protected layout and any page-specific guards so anonymous visitors return to the original page after authentication:
   - `/checkout` → `/login?returnTo=/checkout`
   - `/dashboard/orders/[orderId]` → the same dashboard detail route
   - order confirmation route → the same confirmation route
4. Update the guest-only auth layout so a signed-in visitor to `/login?returnTo=/checkout` continues to the safe requested destination; use `/dashboard` role landing when there is no safe destination.
5. Replace placeholder legacy routes with canonical redirects:
   - `/orders` → `/dashboard/orders`
   - `/dashboard/user` → `/dashboard/profile`
6. Add public and protected `not-found` states, including an order-not-found state that does not reveal order ownership.
7. Add unit tests for return-target sanitization and browser tests for checkout/login resumption, denied staff URLs, and signed-in visits to auth pages.

**Acceptance gate:** Login resumes an allowed page without open redirects or loops; old routes no longer render placeholder content; unauthorized users cannot infer protected records.

## Phase F1 — account recovery, verification, and session security

**Goal:** Make an account recoverable and secure enough for production use.

1. Obtain owner decisions for email verification policy, email delivery provider, password requirements, reset-token lifetime, and account recovery support process.
2. Configure Better Auth trusted origins, production URL, HTTPS-only cookies, a rotation procedure for `BETTER_AUTH_SECRET`, and rate limits for sign-in, sign-up, reset, and resend actions.
3. Implement these pages and server endpoints with generic responses that do not reveal account existence:
   - `/forgot-password`
   - `/reset-password`
   - `/verify-email`
   - `/verify-email/expired`
   - resend-verification action/state
4. Require a recent session or password re-entry before sensitive changes such as password/email change, where Better Auth supports it.
5. Add clear session-expired, rate-limited, and delivery-failed feedback that works with keyboard and screen readers.
6. Record sign-in failure thresholds, reset requests/completions, password changes, and verification/privilege changes in the audit system without recording secrets or reset tokens.
7. Add integration tests for token expiry, one-time use, rate limits, safe error messages, authenticated credential changes, and protected account ownership.

**Acceptance gate:** A legitimate account can safely recover access; abuse controls are enforced; no auth response leaks account existence or secrets.

## Phase F2 — release real public and policy content

**Goal:** Replace every public placeholder with approved, operable information.

1. Collect owner-approved store names, addresses, phones, directions, Ethiopia-local hours, contact channels, social links, privacy text, terms, cancellation policy, and pay-at-pickup policy.
2. Decide the source of truth for public/business content:
   - store operational data in secured `StoreLocation` management; and
   - legal/marketing text in version-controlled content or an approved CMS with an owner and review process.
3. Replace `/locations` with active-store cards sourced from approved store records. Include address, phone, hours, pickup availability, and directions only when real.
4. Replace `/contact` with approved contact paths and order-help guidance. Add a form only after assigning its recipient, retention policy, spam protection, and response owner.
5. Replace `/privacy` and `/terms` with reviewed legal content, including order cancellation and data/contact policies.
6. Replace `/about` and `/careers` with approved content, a real application destination, or remove their primary navigation links.
7. Add content review dates and tests/checks that prevent “Coming Soon”, placeholder phone numbers, or development addresses from shipping.

**Acceptance gate:** Every public navigation target has approved content or is intentionally removed; no customer sees placeholder business/legal data.

## Phase F3 — complete secured store and catalogue administration

**Goal:** Let authorized staff maintain operational data without direct database access.

1. Add a migration only if required for store/category lifecycle, ordering, or audit fields; do not alter applied migrations.
2. Build `/dashboard/admin/stores` for `ADMIN` and `SUPERADMIN` with server-side `manage:stores` authorization. Support create/edit/archive, address, phone, hours, timezone, capacity, lead time, and pickup interval.
3. Validate Ethiopia-local operating-hour shapes, intervals, capacity, IDs, and active-store constraints on the server. Audit every mutation.
4. Replace the image-only add-product screen with a complete product form: name, category, price, description, image, and active state. Keep upload validation and server authorization.
5. Build category management with server-side `manage:categories` checks; block destructive removal of categories with products or use archive/retire semantics.
6. Add product/category listing search, filters, empty states, error states, and safe archive/reactivation controls.
7. Test direct API/action requests for anonymous, customer, cashier, admin, and superadmin accounts; ensure a public menu exposes only active products.

**Acceptance gate:** Authorized administrators can maintain stores and catalogue safely; every mutation is validated, audited, and inaccessible to unauthorized roles.

## Phase F4 — finish customer and staff operational workflows

**Goal:** Turn the first-pass dashboards into complete day-to-day workflows.

1. Add customer order support from order details: a non-sensitive help path that supplies an order number without exposing data to another account.
2. Decide and implement notifications for order received, confirmed, ready for pickup, cancelled, and store exceptions. Store delivery attempts/statuses; never make an order depend on a notification succeeding.
3. Add a staff order-detail page with permitted transition actions, store scope, pickup details, and audit timeline. Define exception/cancellation/refund handling explicitly; pay-at-pickup means no online refund workflow unless payment policy changes.
4. Extend admin order operations with search, date/store/status filters, pagination, and export only after confirming access and retention requirements.
5. Add reporting filters using `Africa/Addis_Ababa`, and document that headline order totals are operational metrics rather than accounting reconciliation until reconciliation is built.
6. Complete staff lifecycle: invitation/activation, offboarding, staff/store assignment history, and a last-superadmin protection rule.
7. Extend audit operations with filters, pagination, retention, and an approved export/access policy.

**Acceptance gate:** Customer support, cashier fulfilment, administration, and superadmin staff management can be performed through authorized workflows with usable audit evidence.

## Phase F5 — decide deferred domains before building them

**Goal:** Prevent non-functional UI and undefined policies from entering the product.

1. **Reservations:** choose one of: remove the unused schema/permissions from v1, or approve a separate reservation specification covering capacity, duration, availability, confirmation, cancellation, and staff management.
2. **Product modifiers:** do not add size/milk/shots UI until the data model supports modifier price snapshots, cart validation, order items, and staff visibility.
3. **Promotions/loyalty:** defer until there is a business owner, fraud policy, accounting treatment, eligibility rules, and a server-side pricing model.
4. **Account deletion/privacy requests:** decide the legal and retention policy before exposing a self-service action.

**Acceptance gate:** Every exposed feature has a complete customer-to-staff workflow and policy; deferred items have no misleading navigation or selectable UI.

## Phase F6 — prove production readiness continuously

**Goal:** Establish the evidence required to release the above safely.

1. Resolve the production build in a clean, network-constrained CI environment and retain the successful artifact/log.
2. Diagnose the local Prisma migration status problem using a disposable database; rehearse `migrate deploy`, status, backup, and restore on staging.
3. Add PostgreSQL integration tests for migrations, order creation, ownership, cancellation, staff-store scope, RBAC, audit records, recovery flows, and transactional failures.
4. Add Playwright role fixtures and critical paths at 375, 768, and 1440 pixels: login/logout, checkout resume, customer order tracking, cashier fulfilment, admin catalogue, superadmin staff lifecycle, and denied access.
5. Configure dependency audit, monitoring, health checks, error reporting, backup alerts, rollback procedure, and operational runbooks in the selected production environment.
6. Rehearse release with two stores and all four roles. Record evidence, owners, rollback decision points, and unresolved risks in the release record.

**Acceptance gate:** CI, staging migration/restore, role-based browser flows, and operational rehearsal pass before production release approval.

## Decisions and external inputs required

| Decision / input | Needed by | Owner |
| --- | --- | --- |
| Email verification and recovery policy; transactional email provider | F1 | Product owner / operations |
| Approved store, contact, legal, and marketing content | F2 | Business owner / legal reviewer |
| Content source of truth and update ownership | F2 | Product owner |
| Store and catalogue administration rules | F3 | Operations owner |
| Notification provider, channels, and consent/retention policy | F4 | Product owner / privacy owner |
| Reservation decision | F5 | Product owner |
| PostgreSQL hosting, backups, monitoring, error tracking, and CI credentials | F6 | Platform owner |

## Recommended execution order

`F0 redirects and canonical routes → F1 recovery/security → F2 approved public content → F3 store/catalogue management → F4 operational workflows → F5 deferred-domain decisions → F6 release proof`

F6 test and staging work should begin during F0 and continue through every later phase; it is the final release gate, not a post-launch task.

## Recorded policy decisions

- **2026-08-23 — Email verification is optional for the current release.** K-Coffee sends verification emails on sign-up and exposes resend/status UI, but does not block sign-in or customer ordering for an unverified account. Before making verification mandatory, add a migration/communication plan for existing accounts and test the resulting sign-in behavior.
