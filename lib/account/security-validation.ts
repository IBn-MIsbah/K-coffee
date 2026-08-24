import { z } from "zod";

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters for your new password.")
      .max(128, "Use 128 characters or fewer for your new password."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Your new password and confirmation do not match.",
    path: ["confirmPassword"],
  });

export const emailChangeSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Use 254 characters or fewer for your email address."),
});
