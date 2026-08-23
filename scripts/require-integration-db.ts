import "dotenv/config";

const sourceUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const databaseUrl = sourceUrl && process.env.INTEGRATION_DATABASE_NAME
  ? (() => { const url = new URL(sourceUrl); url.pathname = `/${process.env.INTEGRATION_DATABASE_NAME}`; return url.toString(); })()
  : sourceUrl;

if (!databaseUrl) {
  throw new Error("Set TEST_DATABASE_URL (or DATABASE_URL) to a disposable PostgreSQL database before running integration tests.");
}

let databaseName = "";
try {
  databaseName = new URL(databaseUrl).pathname.replace(/^\//, "").toLowerCase();
} catch {
  throw new Error("TEST_DATABASE_URL must be a valid PostgreSQL connection URL.");
}

if (!/(?:test|ci)(?:$|[_-])|(?:[_-](?:test|ci)$)/.test(databaseName)) {
  throw new Error("Integration tests refuse to run unless the database name contains 'test' or 'ci'.");
}
