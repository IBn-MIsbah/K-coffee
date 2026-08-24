import { z } from "zod";

const productIdSchema = z.string().trim().min(1, "Choose a product to save.").max(191, "Choose a valid product.");

export class FavoriteValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FavoriteValidationError";
  }
}

export function parseFavoriteProductId(value: unknown) {
  const result = productIdSchema.safeParse(value);
  if (!result.success) throw new FavoriteValidationError(result.error.issues[0]?.message ?? "Choose a valid product.");
  return result.data;
}
