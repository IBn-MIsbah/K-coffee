# Production deployment

Production deployment deliberately does **not** run `db:seed`. That development seed creates demo accounts and placeholder store data, so it is blocked when `DEPLOY_ENV=production`.

## Release order

1. Copy the values from `production.env.example` into the secret manager used by the deployment platform. Replace every example value with approved production data; never commit the resulting values.
2. Run `npm run ci` in CI before releasing. It generates the client, lints, type-checks, runs unit tests, and builds the application.
3. Run `npm run deploy:production` once against the target database. It validates the explicit production environment, generates Prisma, applies committed migrations, synchronizes RBAC permissions, and verifies migration status.
4. For a brand-new empty database only, review the exact store, administrator, hours, and catalogue values, then run `npm run seed:production` separately. It requires `PRODUCTION_SEED_CONFIRM=I_UNDERSTAND_PRODUCTION_SEEDING`.
5. Deploy the application artifact and complete a customer order and staff pickup smoke test.

## Bootstrap behaviour

`seed:production` creates only the administrator, store, categories, and products supplied through the production environment. It is idempotent and never overwrites existing store, catalogue, or credential records. Changing production data after launch must use the secured dashboard workflows.

## Rollback

Do not use `prisma migrate reset` or `db:reset` in production. Restore application traffic to the previous compatible artifact and follow the migration-specific rollback procedure before attempting database changes. Take and verify a database backup before every migration release.
