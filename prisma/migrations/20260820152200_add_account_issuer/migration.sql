-- Better Auth 1.4 scopes external account identities by issuer.
-- Existing credential accounts used the same stable local issuer Better Auth
-- assigns to new password-based accounts. Other legacy providers fall back to
-- their provider ID and can be refined during a provider-specific migration.
ALTER TABLE "account" ADD COLUMN "issuer" TEXT;

UPDATE "account"
SET "issuer" = CASE
  WHEN "providerId" = 'credential' THEN 'local:credential'
  ELSE "providerId"
END
WHERE "issuer" IS NULL;

ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;

CREATE UNIQUE INDEX "account_issuer_accountId_key"
ON "account"("issuer", "accountId");
