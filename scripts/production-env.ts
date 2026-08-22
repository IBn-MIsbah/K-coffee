const unsafeDatabaseHosts = ["localhost", "127.0.0.1", "::1"];

export function requireProductionEnvironment() {
  if (process.env.DEPLOY_ENV !== "production") {
    throw new Error(
      "Refusing to run: set DEPLOY_ENV=production explicitly for a production operation."
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  let databaseHost: string;
  try {
    databaseHost = new URL(databaseUrl).hostname;
  } catch {
    throw new Error("DATABASE_URL must be a valid connection URL.");
  }

  if (unsafeDatabaseHosts.includes(databaseHost)) {
    throw new Error("Refusing to operate on a localhost database in production mode.");
  }

  const authSecret = process.env.BETTER_AUTH_SECRET;
  if (!authSecret || authSecret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be set to at least 32 characters.");
  }
}

export function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}
