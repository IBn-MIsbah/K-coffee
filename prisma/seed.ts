import prisma from "@/lib/prisma";
import { initializePermissions, UserRole } from "@/lib/rbac";
import { auth } from "@/lib/auth";
import { hashPassword } from "better-auth/crypto";

async function seed() {
  if (process.env.DEPLOY_ENV === "production" || process.env.NODE_ENV === "production") {
    throw new Error(
      "The development seed is blocked in production. Use `npm run seed:production` with approved production configuration instead."
    );
  }

  console.log("Seeding database...");

  // Initialize RBAC permissions
  await initializePermissions();

  // 1. Setup Admin and Cashier configuration
  const initialUsers = [
    {
      email: "admin@coffeeshop.com",
      name: "Super Admin",
      role: UserRole.SUPERADMIN,
      password: "Admin123!",
    },
    {
      email: "cashier@coffeeshop.com",
      name: "John Cashier",
      role: UserRole.CASHIER,
      password: "Cashier123!",
    },
  ];

  for (const userData of initialUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
      include: { accounts: true },
    });

    if (!existing) {
      // Creating the user and linking the account exactly how Better Auth expects
      await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      console.log(`${userData.name} created.`);
    } else if (
      !existing.accounts.some(
        (account) => account.providerId === "credential"
      )
    ) {
      // Recover a user left incomplete by an earlier failed seed. This keeps
      // the seed idempotent and creates the same credential account Better
      // Auth creates during email sign-up.
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          issuer: "local:credential",
          accountId: existing.id,
          providerId: "credential",
          userId: existing.id,
          password: await hashPassword(userData.password),
        },
      });
      console.log(`${userData.name}'s credential account was restored.`);
    }

    await prisma.user.update({
      where: { email: userData.email },
      data: {
        role: userData.role,
        emailVerified: true,
      },
    });
  }

  // 2. Product Seeding
  await prisma.storeLocation.upsert({
    where: { id: "k-coffee-addis-ababa" },
    update: {
      timezone: "Africa/Addis_Ababa",
      pickupIntervalMinutes: 20,
      pickupLeadTimeMinutes: 20,
      pickupCapacity: 10,
    },
    create: {
      id: "k-coffee-addis-ababa",
      name: "K-Coffee Addis Ababa",
      address: "Addis Ababa, Ethiopia",
      phone: "+251-000-000-000",
      timezone: "Africa/Addis_Ababa",
      pickupIntervalMinutes: 20,
      pickupLeadTimeMinutes: 20,
      pickupCapacity: 10,
      hours: {
        mon: { open: "07:00", close: "19:00" },
        tue: { open: "07:00", close: "19:00" },
        wed: { open: "07:00", close: "19:00" },
        thu: { open: "07:00", close: "19:00" },
        fri: { open: "07:00", close: "19:00" },
        sat: { open: "07:00", close: "19:00" },
        sun: { open: "07:00", close: "19:00" },
      },
    },
  });

  const cashier = await prisma.user.findUnique({ where: { email: "cashier@coffeeshop.com" } });
  if (cashier) await prisma.staffStoreAssignment.upsert({ where: { userId_storeId: { userId: cashier.id, storeId: "k-coffee-addis-ababa" } }, update: {}, create: { userId: cashier.id, storeId: "k-coffee-addis-ababa" } });

  const products = [
    { name: "Espresso", category: "Coffee", price: 3.5 },
    { name: "Green Tea", category: "Tea", price: 3.0 },
  ];

  for (const product of products) {
    let category = await prisma.category.findUnique({
      where: { slug: product.category.toLowerCase() },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: product.category,
          slug: product.category.toLowerCase(),
        },
      });
    }

    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: {
        name: product.name,
        price: product.price,
        categoryId: category.id,
        imageUrl: `https://example.com/${product.name.toLowerCase()}.jpg`,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
