import { Prisma } from "@/app/generated/prisma/client";

export class CatalogueValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogueValidationError";
  }
}

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CatalogueValidationError("Request data must be an object.");
  }
  return value as RecordValue;
}

function assertOnlyKeys(value: RecordValue, allowed: readonly string[]) {
  const unexpected = Object.keys(value).find((key) => !allowed.includes(key));
  if (unexpected) throw new CatalogueValidationError(`Unsupported field: ${unexpected}.`);
}

function requiredText(value: unknown, field: string, maximum: number) {
  if (typeof value !== "string") throw new CatalogueValidationError(`${field} is required.`);
  const text = value.trim();
  if (!text || text.length > maximum) throw new CatalogueValidationError(`${field} must be between 1 and ${maximum} characters.`);
  return text;
}

function optionalText(value: unknown, field: string, maximum: number) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new CatalogueValidationError(`${field} must be text.`);
  const text = value.trim();
  if (text.length > maximum) throw new CatalogueValidationError(`${field} must be ${maximum} characters or fewer.`);
  return text || null;
}

export type CategoryInput = { name: string; slug: string };

export function parseCategoryInput(value: unknown): CategoryInput {
  const input = asRecord(value);
  assertOnlyKeys(input, ["name", "slug"]);
  const name = requiredText(input.name, "Name", 80);
  const slug = requiredText(input.slug, "Slug", 80).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new CatalogueValidationError("Slug must use lowercase letters, numbers, and single hyphens only.");
  }
  return { name, slug };
}

export type ProductInput = {
  name: string;
  description: string | null;
  price: Prisma.Decimal;
  categoryId: string;
  imageUrl: string | null;
  isActive: boolean;
};

function parsePrice(value: unknown) {
  const text = typeof value === "number" ? String(value) : value;
  if (typeof text !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(text)) {
    throw new CatalogueValidationError("Price must be a positive ETB amount with up to two decimal places.");
  }
  const price = new Prisma.Decimal(text);
  if (price.lte(0) || price.gt(new Prisma.Decimal("100000"))) {
    throw new CatalogueValidationError("Price must be greater than zero and no more than ETB 100,000.");
  }
  return price;
}

function parseImageUrl(value: unknown) {
  const url = optionalText(value, "Image URL", 2048);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") throw new Error();
  } catch {
    throw new CatalogueValidationError("Image URL must be a valid HTTPS URL.");
  }
  return url;
}

export function parseProductInput(value: unknown): ProductInput {
  const input = asRecord(value);
  assertOnlyKeys(input, ["name", "description", "price", "categoryId", "imageUrl", "isActive"]);
  if (typeof input.isActive !== "boolean") throw new CatalogueValidationError("isActive must be a boolean.");
  return {
    name: requiredText(input.name, "Name", 120),
    description: optionalText(input.description, "Description", 1000),
    price: parsePrice(input.price),
    categoryId: requiredText(input.categoryId, "Category", 64),
    imageUrl: parseImageUrl(input.imageUrl),
    isActive: input.isActive,
  };
}
