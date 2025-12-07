import prisma from "@/lib/prisma";
import { initializePermissions, UserRole } from "@/lib/rbac";
import { hash } from "bcryptjs"; // Match hashing used by your Better Auth config

async function seed() {
  console.log("Seeding database...");

  // Initialize RBAC permissions
  await initializePermissions();

  const saltRounds = 10;

  // 1. Setup Admin and Cashier configuration
  const initialUsers = [
    {
      email: "admin@coffeeshop.com",
      name: "Super Admin",
      role: UserRole.SUPERADMIN,
      password: "Admin123!",
      accountId: "admin_credential_id",
    },
    {
      email: "cashier@coffeeshop.com",
      name: "John Cashier",
      role: UserRole.CASHIER,
      password: "Cashier123!",
      accountId: "cashier_credential_id",
    },
  ];

  for (const userData of initialUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existing) {
      const hashedPassword = await hash(userData.password, saltRounds);

      // Creating the user and linking the account exactly how Better Auth expects
      await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          emailVerified: new Date(),
          accounts: {
            create: {
              id: `acc_${userData.accountId}`,
              accountId: userData.accountId,
              providerId: "credential", // Better Auth uses this identifier for email/pass
              password: hashedPassword, // Matches the password field in your Account model
            },
          },
        },
      });
      console.log(`${userData.name} created.`);
    }
  }

  // 2. Product Seeding
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
  .catch(console.error)
  .finally(() => process.exit());
