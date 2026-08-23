import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pricePattern = /^\d+(?:\.\d{1,2})?$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a category name.")
    .max(80, "Category names must be 80 characters or fewer."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter a URL slug.")
    .max(80, "Slugs must be 80 characters or fewer.")
    .regex(
      slugPattern,
      "Use lowercase letters, numbers, and single hyphens only.",
    ),
});

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a product name.")
    .max(120, "Product names must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(1000, "Descriptions must be 1,000 characters or fewer."),
  price: z
    .string()
    .trim()
    .regex(
      pricePattern,
      "Enter a positive ETB amount with up to two decimal places.",
    )
    .refine(
      (value) => Number(value) > 0 && Number(value) <= 100000,
      "Price must be between ETB 0.01 and ETB 100,000.",
    ),
  categoryId: z.string().min(1, "Choose an active category."),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        !value ||
        (() => {
          try {
            return new URL(value).protocol === "https:";
          } catch {
            return false;
          }
        })(),
      "Image URL must be a valid HTTPS address.",
    ),
  isActive: z.boolean(),
});

const dayHoursSchema = z
  .object({
    open: z.string().nullable(),
    close: z.string().nullable(),
  })
  .superRefine((hours, context) => {
    if (hours.open === null && hours.close === null) return;
    if (!hours.open || !hours.close) {
      context.addIssue({
        code: "custom",
        message: "Set both opening and closing times, or mark the day closed.",
      });
      return;
    }
    if (
      !timePattern.test(hours.open) ||
      !timePattern.test(hours.close) ||
      hours.open >= hours.close
    ) {
      context.addIssue({
        code: "custom",
        message: "Closing time must be later than opening time.",
      });
    }
  });

export const storeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a store name.")
    .max(120, "Store names must be 120 characters or fewer."),
  address: z
    .string()
    .trim()
    .min(1, "Enter the pickup address.")
    .max(300, "Addresses must be 300 characters or fewer."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid store phone number.")
    .max(40, "Phone numbers must be 40 characters or fewer."),
  hours: z.object({
    mon: dayHoursSchema,
    tue: dayHoursSchema,
    wed: dayHoursSchema,
    thu: dayHoursSchema,
    fri: dayHoursSchema,
    sat: dayHoursSchema,
    sun: dayHoursSchema,
  }),
  timezone: z.literal("Africa/Addis_Ababa"),
  pickupIntervalMinutes: z
    .number()
    .int()
    .multipleOf(20, "Pickup interval must be in 20-minute increments.")
    .min(20, "Pickup interval must be at least 20 minutes.")
    .max(120, "Pickup interval must be 120 minutes or fewer."),
  pickupLeadTimeMinutes: z
    .number()
    .int()
    .min(0, "Lead time cannot be negative.")
    .max(240, "Lead time must be 240 minutes or fewer."),
  pickupCapacity: z
    .number()
    .int()
    .min(1, "Pickup capacity must be at least one order.")
    .max(200, "Pickup capacity must be 200 orders or fewer."),
  coordinates: z
    .string()
    .trim()
    .max(100, "Coordinates must be 100 characters or fewer.")
    .nullable(),
});

export type FormErrors<T extends Record<string, unknown>> = Partial<
  Record<keyof T, string>
>;

export function toFormErrors<T extends Record<string, unknown>>(
  error: z.ZodError<T>,
): FormErrors<T> {
  const errors: FormErrors<T> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field as keyof T])
      errors[field as keyof T] = issue.message;
  }
  return errors;
}
