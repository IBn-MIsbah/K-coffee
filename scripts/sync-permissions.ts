import prisma from "@/lib/prisma";
import { synchronizePermissions } from "@/lib/rbac";

async function main() {
  await synchronizePermissions();
  console.log("Permission matrix synchronized successfully.");
}

main()
  .catch((error) => {
    console.error("Permission synchronization failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
