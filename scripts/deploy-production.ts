import { spawnSync } from "node:child_process";
import { requireProductionEnvironment } from "./production-env";

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}.`);
  }
}

function main() {
  requireProductionEnvironment();

  console.log("Generating Prisma client...");
  run("npx", ["prisma", "generate"]);

  console.log("Applying production migrations...");
  run("npx", ["prisma", "migrate", "deploy"]);

  console.log("Synchronizing the permission matrix...");
  run("npx", ["tsx", "scripts/sync-permissions.ts"]);

  console.log("Verifying migration status...");
  run("npx", ["prisma", "migrate", "status"]);

  console.log("Production database deployment completed.");
  console.log("Run `npm run seed:production` separately only for an approved first-time bootstrap.");
}

try {
  main();
} catch (error) {
  console.error("Production deployment failed:", error);
  process.exitCode = 1;
}
