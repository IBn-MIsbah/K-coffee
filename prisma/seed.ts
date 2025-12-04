import { PrismaClient, Prisma } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const userData: Prisma.UserCreateInput[] = [
  {
    email: "example@gmail.com",
    name: "Example",
  },
  {
    email: "admin@gmail.com",
    name: "Super-Admin",
  },
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();
