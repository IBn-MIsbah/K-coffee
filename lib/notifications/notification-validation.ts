import { z } from "zod";

export const notificationIdSchema = z
  .string()
  .trim()
  .min(1, "Choose a valid notification.")
  .max(191, "Choose a valid notification.");
