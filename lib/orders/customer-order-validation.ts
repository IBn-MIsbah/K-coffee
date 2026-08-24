import { OrderStatus } from "@/app/generated/prisma/client";
import { z } from "zod";

const historyViews = ["ACTIVE", "COMPLETED", "CANCELLED", "ALL"] as const;

const schema = z.object({
  view: z.preprocess((value) => value === "" ? undefined : value, z.enum(historyViews).default("ACTIVE")),
});

const orderIdSchema = z.string().trim().min(1, "Order details are unavailable.").max(191, "Order details are unavailable.");

export type CustomerOrderHistoryFilters = z.infer<typeof schema>;

export const customerOrderHistoryStatuses: Record<CustomerOrderHistoryFilters["view"], OrderStatus[] | undefined> = {
  ACTIVE: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP],
  COMPLETED: [OrderStatus.COMPLETED],
  CANCELLED: [OrderStatus.CANCELLED],
  ALL: undefined,
};

export class CustomerOrderHistoryFilterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerOrderHistoryFilterError";
  }
}

export function parseCustomerOrderHistoryFilters(input: Record<string, string | string[] | undefined>): CustomerOrderHistoryFilters {
  const view = Array.isArray(input.view) ? input.view[0] : input.view;
  const result = schema.safeParse({ view });
  if (!result.success) throw new CustomerOrderHistoryFilterError("Choose a valid order-history view.");
  return result.data;
}

export function parseCustomerOrderId(orderId: string) {
  const result = orderIdSchema.safeParse(orderId);
  if (!result.success) throw new CustomerOrderHistoryFilterError(result.error.issues[0]?.message ?? "Order details are unavailable.");
  return result.data;
}
