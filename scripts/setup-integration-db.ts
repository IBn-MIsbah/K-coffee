import "dotenv/config";

import { execFileSync } from "node:child_process";
import { Client } from "pg";

async function main() {
  const sourceUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!sourceUrl) throw new Error("Set TEST_DATABASE_URL or DATABASE_URL before preparing the integration database.");

  const testUrl = new URL(sourceUrl);
  const requestedName = process.env.INTEGRATION_DATABASE_NAME ?? "k_coffee_test";
  if (!/^[a-z0-9_]+$/.test(requestedName) || !requestedName.includes("test")) {
    throw new Error("INTEGRATION_DATABASE_NAME must be a lowercase PostgreSQL name containing 'test'.");
  }

  testUrl.pathname = `/${requestedName}`;
  const adminUrl = new URL(sourceUrl);
  adminUrl.pathname = "/postgres";

  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();
  try {
    const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [requestedName]);
    if (!existing.rowCount) {
      await client.query(`CREATE DATABASE "${requestedName}"`);
      console.log(`Created disposable integration database: ${requestedName}`);
    } else {
      console.log(`Using existing disposable integration database: ${requestedName}`);
    }
  } finally {
    await client.end();
  }

  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testUrl.toString(), TEST_DATABASE_URL: testUrl.toString() },
  });
  execFileSync("npx", ["prisma", "db", "seed"], {
    stdio: "inherit",
    // The guarded database name always contains "test". Override deployment
    // markers inherited from a developer's .env so the development fixture
    // seed cannot mistake this disposable database for production.
    env: { ...process.env, DATABASE_URL: testUrl.toString(), TEST_DATABASE_URL: testUrl.toString(), NODE_ENV: "development", DEPLOY_ENV: "test" },
  });
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
