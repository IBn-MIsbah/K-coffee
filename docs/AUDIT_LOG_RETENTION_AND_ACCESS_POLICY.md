# Audit Log Retention and Access Policy — Development Draft

**Status:** Development-only draft; requires privacy and operations approval before production release.  
**Last updated:** August 24, 2026

## Purpose and scope

K-Coffee records security and operational events so authorised operators can investigate access decisions, staff lifecycle actions, catalogue/store administration, and order fulfilment changes. Audit events are immutable application records; they are not a replacement for accounting records, payment-provider records, or security monitoring.

## Access control

- Only an active `SUPERADMIN` may access `/dashboard/admin/audit` and an individual audit event.
- Audit pages are read-only. They do not provide edit, delete, restore, or export operations.
- The list exposes only timestamp, actor identity, actor role, action, resource, and resource ID.
- The detail view redacts secrets, credentials, session/cookie data, payment/bank/card data, IP addresses, user agents, and oversized values before rendering.
- All future audit exports require an approved export-field contract, a named recipient purpose, server-side superadmin authorization, a short-lived safe download response, and an audit event for the export itself.

## Development retention position

No automated deletion, archive, or export job is enabled in this development phase. This avoids accidental loss of evidence while the business has not approved legal, tax, privacy, and security retention periods. Development databases may still be reset or replaced; they must never contain real production customer information.

## Store scope limitation

The current `AuditLog` schema has no first-class `storeId` column. Some order events include a store identifier in JSON details, but the audit UI intentionally does not query that unindexed payload. If store-specific audit filtering becomes an operational requirement, add a nullable indexed `storeId` column through an incremental migration, populate it for new events, define historical backfill behaviour, and extend the filter contract and tests.

## Production decision record required

Before production, the privacy and operations owners must approve and record:

1. The retention period for each audit-event category, including staff actions, access denials, catalogue/store changes, and order lifecycle events.
2. The archival location, encryption, regional storage requirements, access mechanism, and deletion/hold process.
3. Whether actor email and resource identifiers are necessary in the audit UI and any export.
4. The export field list, recipients, purpose, expiry, and incident-response process for accidental disclosure.
5. The accountable owner for scheduled retention enforcement and evidence of successful archive/deletion runs.

## Access-review cadence

- **Weekly:** a superadmin reviews failed/denied access and exceptional staff/order events relevant to operations.
- **Monthly:** a designated privacy or operations owner reviews the active superadmin list and confirms that each account still needs audit access.
- **Quarterly:** the privacy, operations, and security owners review this policy, retention settings, exports (if approved), and any incident findings.
- **On staff departure or role change:** remove or adjust privileged access immediately and verify the resulting audit record.

## Release gate

The application must not enable automated audit deletion, archival, or export until the production decision record above is approved and the implementation has integration and browser-test evidence.
