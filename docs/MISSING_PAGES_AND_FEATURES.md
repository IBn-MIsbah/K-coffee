# Missing pages and features inventory

**Reviewed:** 2026-08-22  
**Scope:** Routes, dashboard workflows, route handlers, Prisma domain, and release documentation in the current repository. This is an implementation inventory, not a commitment to add every item to v1.

## Summary

The core authenticated pickup ordering path exists: an account can add active products to a cart, choose a pickup slot, submit a pay-at-pickup order in ETB with 15% VAT, and view its order. Cashiers, administrators, and superadmins also have working first-pass dashboards.

The largest remaining gaps are public/business content, catalogue and store administration, account recovery, fuller customer support workflows, and production operations.

## Missing or placeholder pages

| Priority | Page / route | Current state | Needed outcome |
| --- | --- | --- | --- |
| P0 | Password reset request and reset confirmation | No route or flow. | Allow an account holder to request a rate-limited reset and set a new password using a short-lived token. |
| P0 | Email verification and resend verification | No route or policy. | Define whether verification is required, then provide verification, expiry, and resend screens. |
| P1 | Store locations | `/locations` is a “Coming Soon” page. | Show only active stores with approved address, phone, Ethiopia-local hours, pickup information, and directions. |
| P1 | Contact / support | `/contact` is a “Coming Soon” page. | Provide approved contact channels, expected response time, order-help guidance, and an accessible contact form only if it has an owned delivery process. |
| P1 | Legal pages | `/privacy` and `/terms` are placeholders. | Publish legally approved privacy, terms, order cancellation, and pay-at-pickup policies before launch. |
| P2 | About and careers | `/about` and `/careers` are placeholders. | Replace with approved content, link to a real hiring channel, or remove from primary navigation. |
| P2 | Legacy customer routes | `/orders` and `/dashboard/user` render placeholders while the implemented pages are under `/dashboard/orders` and `/dashboard/profile`. | Redirect these legacy routes to their canonical destinations or remove them to avoid duplicate, empty journeys. |
| P2 | Not-found experience | No route-specific `not-found.tsx` is present. | Add branded public and protected not-found states with safe navigation. |
| P2 | Customer support order view | Customers have order history/detail, but no help/contact action from an order. | Add a support path that references an order number without exposing another customer’s data. |
| P3 | Reservation pages | Reservations exist in the schema and permission model, but no customer or staff workflow exists. | Either remove/defer reservations from v1 or implement availability, create, change, cancel, and staff management screens. |

## Missing customer-facing features

| Priority | Feature | Required work |
| --- | --- | --- |
| P0 | Account recovery and verification | Password reset, email verification policy, resend limits, session-expiry messaging, and audit logging for sensitive account events. |
| P1 | Reliable business information | Replace all placeholder contact, address, phone, hours, social, legal, and policy content with owner-approved data. The production bootstrap deliberately requires these values; the public site should read the same approved source. |
| P1 | Product options/modifiers | The data model and checkout do not support milk, size, shots, notes, or priced modifiers. Keep option UI absent until options are represented in cart and order snapshots. |
| P1 | Order notifications | No customer receipt, confirmation, ready-for-pickup notification, or staff escalation channel is implemented. Decide email/SMS/other provider and record delivery attempts. |
| P1 | Customer order assistance | No customer-initiated issue, cancellation reason, or support ticket workflow exists beyond the current policy-controlled cancellation action. |
| P2 | Store selection usability | Checkout can select active stores, but there is no public store finder/detail view or capacity explanation. |
| P2 | Accessibility/resilience coverage | Add loading, error, empty, offline, and not-found states where absent; complete keyboard, screen-reader, reduced-motion, and small-screen testing. |
| P3 | Promotions and loyalty | There is no coupon, loyalty, gift card, or member-benefit domain. Treat as a separate scoped project rather than client-side price changes. |

## Missing staff and administration features

| Priority | Feature | Current state and required work |
| --- | --- | --- |
| P0 | Store/location management | Stores can be configured by bootstrap but do not have a secured management page. Build active state, address, phone, hours, timezone, pickup capacity, lead time, and interval controls with audit events. |
| P1 | Product create/edit workflow | The admin overview can archive/activate products and `/dashboard/admin/add-product` uploads an image, but there is no complete validated product form. Add create, edit, category assignment, price, description, image, active state, and audit logging. |
| P1 | Category management | Categories exist but have no management UI/API. Add create, rename, ordering if needed, and archive/delete rules that protect referenced products. |
| P1 | Order operations | Cashiers can process the queue; administrators can view recent orders. Add searchable/filterable order history, a full staff order detail, exception handling, cancellation/refund policy controls, and operational notes only where policy permits. |
| P2 | Dashboard reporting | Current overview contains headline metrics only. Add date/store filters, a defined reporting timezone, export policy, and reconciliation views before calling it financial reporting. |
| P2 | Staff lifecycle | Superadmins can assign roles and stores, but invitation, offboarding, last-superadmin safeguards, and staff activity/history are not a complete workflow. |
| P2 | Audit log operations | The audit page shows the latest 100 events only. Add filtering, pagination, retention, export/access rules, and a documented immutable-event policy. |
| P3 | Reservation operations | Implement only if reservations are kept in scope; otherwise remove unused permissions and navigation promises. |

## Missing platform and release features

| Priority | Feature | Required work |
| --- | --- | --- |
| P0 | Browser and integration test coverage | Add isolated PostgreSQL integration tests for auth, ownership, orders, permissions, and migrations; add Playwright flows for customer, cashier, admin, and superadmin journeys. |
| P0 | Production build resolution | The external font dependency was removed, but the production build must pass reliably in a clean CI environment before release. |
| P0 | Migration rehearsal | Diagnose the local Prisma schema-engine status failure and rehearse `migrate deploy` plus restore on staging. |
| P1 | Monitoring, backups, and runbooks | Add error reporting, metrics/alerts, health checks, tested backup/restore, incident contacts, rollback process, and audit retention policy. |
| P1 | Security hardening | Configure trusted origins, secure cookies, login/reset rate limits, credential policy, secret rotation, dependency remediation, and security-event audit policy. |
| P2 | Content management ownership | Decide whether approved store/legal/public content lives in database settings, a CMS, or version-controlled content; add an approval/update process. |

## Recommended delivery order

1. Complete account recovery/verification, legal/business content, integration/browser tests, production build, and staging migration rehearsal.
2. Build store, catalogue, category, and order-operations management so staff do not rely on direct database changes.
3. Add customer notifications and support workflow after deciding the communication provider and privacy policy.
4. Resolve the reservation decision and defer loyalty/promotions until the core operation is stable.
