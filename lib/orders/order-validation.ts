import { OrderStatus } from "@/app/generated/prisma/client";
import { z } from "zod";

export const staffOrderTransitionSchema = z.object({
  nextStatus: z.nativeEnum(OrderStatus, { error: "Choose a valid order status." }),
});

export class OrderTransitionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderTransitionValidationError";
  }
}

export function parseStaffOrderTransition(input: unknown) {
  const result = staffOrderTransitionSchema.safeParse(input);
  if (!result.success) throw new OrderTransitionValidationError(result.error.issues[0]?.message ?? "Choose a valid order status.");
  return result.data;
}
