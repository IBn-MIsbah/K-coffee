# Prerender Database Audit

## Cause

Next attempted to statically generate routes that execute Prisma queries during render. Vercel build workers do not have the production database available, so prerendering fails before deployment.

## Affected public surfaces

| Surface | Database dependency | Fix |
| --- | --- | --- |
| Public layout / footer | Active store address and phone | Force the public route tree to runtime rendering. |
| `/` | Popular products and shared footer | Covered by public runtime rendering. |
| `/locations` | Active store locations | Covered by public runtime rendering. |
| `/contact` | Active store contacts | Covered by public runtime rendering. |
| `/privacy` and `/terms` | Active store address | Covered by public runtime rendering. |

## Other database-backed routes

Protected dashboard, checkout, POS, order, and verification routes read sessions/headers or are protected; they are request-time workflows and should not be statically generated. API routes are request handlers and are not prerendered.

## Operational rule

Any page or shared layout that imports Prisma directly, or imports a component/service that does, must declare request-time rendering (`dynamic = "force-dynamic"`) unless it has an explicit build-time data source and deployment database access.
