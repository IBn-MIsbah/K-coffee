import "dotenv/config";
import { spawn } from "node:child_process";

const sourceUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!sourceUrl) throw new Error("Set TEST_DATABASE_URL or DATABASE_URL before starting the integration server.");
const databaseUrl = new URL(sourceUrl);
databaseUrl.pathname = `/${process.env.INTEGRATION_DATABASE_NAME ?? "k_coffee_test"}`;
if (!databaseUrl.pathname.includes("test")) throw new Error("The integration server requires a database name containing 'test'.");

const child = spawn("npx", ["next", "dev", ...process.argv.slice(2)], { stdio: "inherit", env: { ...process.env, DATABASE_URL: databaseUrl.toString() } });
child.on("exit", (code) => process.exit(code ?? 1));
