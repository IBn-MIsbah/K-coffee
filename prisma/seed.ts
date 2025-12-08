import prisma from "@/lib/prisma";
import { initializePermissions, UserRole } from "@/lib/rbac";
import { auth } from "@/lib/auth";

async function seed() {
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

      await prisma.user.update({
        where: { email: userData.email },
        data: {
          role: userData.role,
          emailVerified: true,
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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
