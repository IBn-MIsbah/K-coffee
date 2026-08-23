# Phase F3 — Secured Store and Catalogue Administration Plan

**Parent:** `FEATURE_AND_ACCESS_REMEDIATION_PLAN.md`  
**Priority:** P1  
**Goal:** Allow authorized administrators to maintain active store locations, categories, and products without direct database access, while preserving public-menu safety and order history.

## Fixed operating policy

- Customer ordering remains authenticated-only, pickup-only, and pay-at-pickup.
- Customer prices remain ETB with 15% VAT calculated from the server-validated catalogue price.
- Store availability uses `Africa/Addis_Ababa` local time and the existing 20-minute pickup interval policy unless a store is configured differently by an authorized administrator.
- `ADMIN` and `SUPERADMIN` may manage stores and catalogue data. `SUPERADMIN` retains staff-assignment administration. `USER` and `CASHIER` must not mutate administration data.
- Archive/retire records instead of deleting a store, category, or product when it could affect historical orders, staff assignments, or audit evidence.

## Implementation status — 2026-08-23

| Workstream | Status | Evidence / remaining gate |
| --- | --- | --- |
| F3.0 contracts | Complete | Validation modules, lifecycle semantics, and audit vocabulary are implemented in `lib/admin/`. |
| F3.1 data model | Ready for staging verification | The new lifecycle migration is ordered as one migration and `prisma validate` passes. Local `prisma migrate status` cannot connect to the configured PostgreSQL instance, so migration deploy and seed validation must run against CI or a disposable staging database. |
| F3.2–F3.5 administration | Implemented | Authorized store and catalogue APIs, lifecycle-aware dashboard screens, image upload, audit logging, and public visibility filters are in place. |
| F3.6 automated evidence | Partial | Unit validation coverage is present. PostgreSQL integration tests and browser role-flow tests remain required before the phase can be declared complete. |
| F3.7 release preparation | Pending | Apply and verify the migration once in staging, then commit the work in the planned dependency order. |

**Current release blocker:** do not deploy the new schema until `npx prisma migrate deploy`, `npx prisma migrate status`, and a seed/smoke flow have passed against a disposable PostgreSQL database. The configured local database did not return a usable schema-engine response on 2026-08-23.

## Current baseline

| Area | Present | Gap to close |
| --- | --- | --- |
| Store data | `StoreLocation` already contains address, phone, hours, timezone, interval, lead time, capacity, coordinates, and `isActive`. | No admin store page, CRUD API, validation, mutation audit, or archive UX. |
| Products | Admin overview lists all products and can toggle `isActive`; a protected image-upload page exists. | No complete create/edit form, filters, search, category picker, robust errors, or product create endpoint. |
| Categories | `Category` has name, slug, and products relation. | No category management, archive state, or protection against destructive deletion. |
| Authorization | `manage:stores`, `manage:products`, and `manage:categories` permissions exist for `ADMIN`; `SUPERADMIN` bypasses the permission matrix. | New page, API, and server-action boundaries must consistently call `requirePermission`. |
| Audit | Product active-state changes and staff-store assignments log audit records. | Store, category, and full product mutations need structured audit entries. |
| Public views | Locations and contact read active store data; menu reads active products. | Admin mutations must preserve these public assumptions and never expose inactive products/stores. |

## Non-goals

- Reservations, modifiers, promotions, loyalty, inventory, payment capture, or a CMS.
- Public self-service store editing.
- Permanent deletion of products, categories, or stores in this phase.
- Changes to historical order-item price snapshots or completed-order records.

## Delivery sequence

### F3.0 — Establish contracts before UI work

1. Inventory every consumer of `StoreLocation`, `Product`, and `Category`: checkout availability, pickup-slot calculation, public menu, locations/contact pages, staff assignment, seed scripts, and admin dashboard.
2. Record request/response schemas in code with one shared server validation module; do not duplicate validation independently in client components and routes.
3. Confirm two implementation decisions with the product/operations owner:
   - a category may be archived only when no active products remain, or the UI will require products to be reassigned first;
   - whether an `ADMIN` may edit every store or only assigned stores. Default for this phase: every `ADMIN` with `manage:stores` may manage all stores.
4. Define audit vocabulary before implementation:
   - stores: `create`, `update`, `archive`, `restore`;
   - categories: `create`, `update`, `archive`, `restore`;
   - products: `create`, `update`, `archive`, `restore`.
5. Audit details must contain only operational before/after fields and record IDs—never passwords, session tokens, raw file contents, or unvalidated request bodies.

**Exit criterion:** Data contracts, ownership, archive semantics, and audit names are agreed and written next to the implementation.

### F3.1 — Make the data model support safe lifecycle operations

1. Review the current schema and applied migrations. Never modify an applied migration.
2. Add a new Prisma migration only for fields that are required to safely operate the UI:
   - `Category.isActive Boolean @default(true)` for archive/restore semantics;
   - `Category.createdAt` and `Category.updatedAt` for operational traceability;
   - `StoreLocation.createdAt` and `StoreLocation.updatedAt` for operational traceability.
3. Do **not** add a separate store archive table. `StoreLocation.isActive` already provides the intended lifecycle state.
4. Backfill existing categories as active and validate the migration against a disposable PostgreSQL database before it is committed.
5. Regenerate Prisma client and update seed/production seed paths only if the new required fields need explicit values.

**Verification:** `prisma validate`, migration deploy on a disposable database, and a seed run all succeed.

### F3.2 — Build server validation and store administration APIs

1. Create a server-only store validation module, for example `lib/admin/store-validation.ts`, which:
   - trims and bounds name, address, phone, and optional coordinates;
   - accepts only `Africa/Addis_Ababa` for v1 unless multi-timezone support is explicitly approved;
   - requires an hours object with all seven day keys and valid `HH:mm` values;
   - allows a closed day only through an explicit closed representation; rejects ambiguous/missing times;
   - ensures opening time precedes closing time;
   - restricts pickup interval to a positive configured value, initially multiples of 20 minutes;
   - restricts lead time and capacity to positive bounded integers;
   - rejects unexpected fields rather than silently persisting them.
2. Add the following `/api/admin/stores` route family. Every mutation must call `requirePermission({ action: "manage", resource: "stores" })` before parsing or writing data:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/stores` | List active and archived stores for authorized admins. |
| `POST` | `/api/admin/stores` | Create a store and write a `create:stores` audit record. |
| `GET` | `/api/admin/stores/[storeId]` | Return one store for editing. |
| `PATCH` | `/api/admin/stores/[storeId]` | Update validated operational fields and audit the changed fields. |
| `POST` | `/api/admin/stores/[storeId]/archive` | Set `isActive: false`; reject archive when operational policy says it is unsafe. |
| `POST` | `/api/admin/stores/[storeId]/restore` | Reactivate a store only when its operational configuration is valid. |

3. Use transactions when a mutation changes the store and writes its audit record.
4. Define safe error responses: `401` unauthenticated, `403` unauthorized, `404` missing, `409` lifecycle conflict, `422` validation failure, and `500` generic unexpected error. Never expose raw Prisma errors.
5. Make store archive behavior explicit: archived stores disappear from public locations and checkout selection but remain visible in the admin list and historical orders.

**Exit criterion:** Direct API calls cannot create, modify, archive, or restore a store without server authorization and validated data.

### F3.3 — Deliver the store-management UI

1. Add `/dashboard/admin/stores`, protected at the page boundary with `requirePageRole([ADMIN, SUPERADMIN])` and at every mutation with `manage:stores` permission.
2. Add a **Stores** sidebar item for `ADMIN` and `SUPERADMIN`; do not expose it to cashiers or customers.
3. Implement a server-rendered store list with:
   - active/archived status, name, address, phone, timezone, interval, lead time, and capacity;
   - search by store name/address;
   - active/archived/all filters;
   - empty, loading, validation, and save-failure states;
   - a clear archive/restore control with confirmation before archive.
4. Implement a create/edit form with labelled fields, help text for local operating hours, field-level errors, and a reviewable schedule editor for all seven days.
5. Do not use a browser timezone for validation. Explain in the interface that all operating-hour values are Ethiopia local time.
6. Keep controls keyboard accessible, use at least 44px interactive targets, preserve entered values after validation errors, and visibly distinguish archive/destructive actions.

**Exit criterion:** An authorized administrator can complete a valid store create/edit/archive/restore flow entirely from the dashboard.

### F3.4 — Complete catalogue and category server operations

1. Create server-only category and product validation modules:
   - category name and URL-safe unique slug;
   - product name, active category ID, non-negative ETB price with two-decimal precision, optional bounded description, optional validated image URL, and `isActive`.
2. Add the category API family under `/api/admin/categories`:
   - list, create, update, archive, and restore;
   - enforce `manage:categories` on every endpoint;
   - reject archive if active products still reference the category, returning a useful `409` response;
   - audit every successful mutation.
3. Expand the product API family under `/api/admin/products`:
   - retain the existing secure archive/restore endpoint but move it to shared validation/audit helpers;
   - add create, read-for-edit, and patch endpoints;
   - require `manage:products` on every mutation;
   - allow product archive even when historical order items reference it;
   - reject assignment to inactive/nonexistent categories;
   - audit the changed fields and never overwrite order snapshots.
4. Keep image upload separate from product persistence. The upload endpoint returns a validated URL; the create/update product endpoint decides whether to attach it.
5. Do not silently delete uploaded-but-unused files in this phase; document that cleanup requires storage ownership and retention policy.

**Exit criterion:** All catalogue mutations use a consistent server authorization, validation, transaction, and audit pattern.

### F3.5 — Replace the incomplete catalogue screens

1. Replace the image-only add-product screen with a complete create-product page that can upload/select an image and submit all product fields.
2. Add an edit-product page or an edit drawer from the catalogue list; never expose management controls in the public menu.
3. Expand the current product list with search, category filter, active/archived filter, price, image status, empty states, and accessible archive/restore actions.
4. Add `/dashboard/admin/categories` with a compact category list and create/edit/archive flows. Do not show a delete action.
5. Ensure the public menu and product-detail API query only active products in active categories. Verify inactive items remain accessible only to authorized administration views.
6. Update sidebar/dashboard shortcuts to use canonical dashboard URLs and avoid duplicate “add product” paths.

**Exit criterion:** An authorized admin can create a category, create a product in it, edit it, archive it, restore it, and observe the correct public-menu visibility.

### F3.6 — Test the authorization and data integrity matrix

1. Add unit tests for hours parsing, ETB price parsing, slug normalization, archive conflict decisions, and error mapping.
2. Add PostgreSQL integration tests for every store/category/product mutation:

| Actor | Expected result |
| --- | --- |
| Anonymous | `401`; no record or audit mutation. |
| `USER` | `403`; no record or audit mutation. |
| `CASHIER` | `403`; no record or audit mutation. |
| `ADMIN` | Authorized for stores, products, and categories. |
| `SUPERADMIN` | Authorized for stores, products, and categories. |

3. Test malformed hours, negative capacity/lead time, invalid interval, duplicate slug/name, inactive category assignment, archive conflict, missing IDs, and concurrent update behavior.
4. Assert every successful mutation writes exactly one expected audit record with actor, action, resource, resource ID, and a safe details payload.
5. Add browser role flows at 375, 768, and 1440 pixels:
   - admin creates and archives a store;
   - admin creates a category and product;
   - public locations/menu hide archived records;
   - customer and cashier are denied direct admin URLs and APIs;
   - superadmin can perform the same successful flows.
6. Run `npm run content:check`, `npm run check`, `npm run test:unit`, migration checks, and browser tests in CI.

**Exit criterion:** Authorization, lifecycle rules, audit evidence, and public visibility are proven automatically.

### F3.7 — Release preparation and commit order

1. Commit migration/schema/client changes separately from application behavior.
2. Commit store validation/API/service changes separately from the store dashboard UI.
3. Commit category/product API and validation changes separately from catalogue UI changes.
4. Commit tests and documentation after their covered behavior is present.
5. Before deployment, run migration status against staging, apply the migration once, seed only approved non-production data, and verify one archive/restore flow with an admin account.

## Proposed implementation order

`F3.0 contracts → F3.1 migration → F3.2 store APIs → F3.3 store UI → F3.4 category/product APIs → F3.5 catalogue UI → F3.6 test matrix → F3.7 staging release check`

## Acceptance gate

Phase F3 is complete only when an `ADMIN` or `SUPERADMIN` can maintain stores, categories, and products through authorized dashboard workflows; all inputs are server-validated; archive behavior preserves order history; public pages expose only active data; every successful mutation is audited; and the role/data-integrity test matrix passes.
