import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Enter a name with at least 2 characters.").max(80, "Name must be 80 characters or fewer."),
  phone: z.string().trim().max(30, "Phone must be 30 characters or fewer."),
  defaultStoreId: z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().min(1, "Choose a valid pickup location.").max(191, "Choose a valid pickup location.").nullable().optional(),
  ),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export class ProfileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileValidationError";
  }
}

export function parseProfileUpdate(input: unknown) {
  const result = profileUpdateSchema.safeParse(input);
  if (!result.success) throw new ProfileValidationError(result.error.issues[0]?.message ?? "Check your profile details and try again.");
  return result.data;
}

export function getDefaultStoreId(preferences: unknown) {
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) return null;
  const value = (preferences as Record<string, unknown>).defaultStoreId;
  return typeof value === "string" && value.trim() ? value : null;
}
