import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import prisma from "@/lib/prisma";
import { initializePermissions, UserRole } from "@/lib/rbac";
import { requiredEnvironment, requireProductionEnvironment } from "./production-env";

type ProductSeed = {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
};

type CategorySeed = {
  name: string;
  slug: string;
  products: ProductSeed[];
};

function parseJson(name: string): unknown {
  try {
    return JSON.parse(requiredEnvironment(name));
  } catch {
    throw new Error(`${name} must be valid JSON.`);
  }
}

function parseCatalogue(value: unknown): CategorySeed[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("PRODUCTION_CATALOG_JSON must be a non-empty category array.");
  }

  const categories = value as CategorySeed[];
  for (const category of categories) {
    if (!category || typeof category.name !== "string" || typeof category.slug !== "string") {
      throw new Error("Every catalogue category needs string name and slug values.");
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.slug)) {
      throw new Error(`Invalid category slug: ${category.slug}`);
    }
    if (!Array.isArray(category.products) || category.products.length === 0) {
      throw new Error(`Category ${category.slug} needs at least one product.`);
    }
    for (const product of category.products) {
      if (!product || typeof product.name !== "string" || !Number.isFinite(product.price) || product.price < 0) {
        throw new Error(`Each product in ${category.slug} needs a name and non-negative numeric price.`);
      }
    }
  }

  return categories;
}

async function main() {
  requireProductionEnvironment();

  if (process.env.PRODUCTION_SEED_CONFIRM !== "I_UNDERSTAND_PRODUCTION_SEEDING") {
    throw new Error(
      "Refusing to seed. Set PRODUCTION_SEED_CONFIRM=I_UNDERSTAND_PRODUCTION_SEEDING after approving the supplied data."
    );
  }

  const adminEmail = requiredEnvironment("PRODUCTION_ADMIN_EMAIL").toLowerCase();
  const adminName = requiredEnvironment("PRODUCTION_ADMIN_NAME");
  const adminPassword = requiredEnvironment("PRODUCTION_ADMIN_PASSWORD");
  if (adminPassword.length < 16) {
    throw new Error("PRODUCTION_ADMIN_PASSWORD must be at least 16 characters.");
  }

  const storeId = requiredEnvironment("PRODUCTION_STORE_ID");
  const catalogue = parseCatalogue(parseJson("PRODUCTION_CATALOG_JSON"));
  const hours = parseJson("PRODUCTION_STORE_HOURS_JSON");
  if (!hours || Array.isArray(hours) || typeof hours !== "object") {
    throw new Error("PRODUCTION_STORE_HOURS_JSON must be an opening-hours object.");
  }

  await initializePermissions();

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { accounts: true },
  });

  if (!existingAdmin) {
    const user = await prisma.user.create({
      data: { id: crypto.randomUUID(), email: adminEmail, name: adminName, role: UserRole.SUPERADMIN, emailVerified: true },
    });
    await prisma.account.create({ data: { id: crypto.randomUUID(), issuer: "local:credential", accountId: user.id, providerId: "credential", userId: user.id, password: await hashPassword(adminPassword) } });
  } else if (!existingAdmin.accounts.some((account) => account.providerId === "credential")) {
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        issuer: "local:credential",
        accountId: existingAdmin.id,
        providerId: "credential",
        userId: existingAdmin.id,
        password: await hashPassword(adminPassword),
      },
    });
  }

  await prisma.user.update({
    where: { email: adminEmail },
    data: { role: UserRole.SUPERADMIN, emailVerified: true },
  });

  await prisma.storeLocation.upsert({
    where: { id: storeId },
    update: {},
    create: {
      id: storeId,
      name: requiredEnvironment("PRODUCTION_STORE_NAME"),
      address: requiredEnvironment("PRODUCTION_STORE_ADDRESS"),
      phone: requiredEnvironment("PRODUCTION_STORE_PHONE"),
      hours,
      timezone: process.env.PRODUCTION_STORE_TIMEZONE || "Africa/Addis_Ababa",
      pickupIntervalMinutes: Number(process.env.PRODUCTION_PICKUP_INTERVAL_MINUTES || "20"),
      pickupLeadTimeMinutes: Number(process.env.PRODUCTION_PICKUP_LEAD_MINUTES || "20"),
      pickupCapacity: Number(process.env.PRODUCTION_PICKUP_CAPACITY || "10"),
    },
  });

  for (const categorySeed of catalogue) {
    const category = await prisma.category.upsert({
      where: { slug: categorySeed.slug },
      update: {},
      create: { name: categorySeed.name, slug: categorySeed.slug },
    });

    for (const product of categorySeed.products) {
      await prisma.product.upsert({
        where: { name: product.name },
        update: {},
        create: {
          name: product.name,
          price: product.price,
          description: product.description,
          imageUrl: product.imageUrl,
          isActive: product.isActive ?? true,
          categoryId: category.id,
        },
      });
    }
  }

  console.log("Production bootstrap completed. Existing store, catalogue, and credential data was not overwritten.");
}

main()
  .catch((error) => {
    console.error("Production seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
