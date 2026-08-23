import { OrderStatus } from "@/app/generated/prisma/client";
import { z } from "zod";

const optionalText = z.preprocess((item) => item === "" ? undefined : item, z.string().trim().min(1).max(100).optional());
const optionalDate = z.preprocess((item) => item === "" ? undefined : item, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.").optional());

const filterSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  storeId: optionalText,
  status: z.preprocess((item) => item === "" ? undefined : item, z.nativeEnum(OrderStatus).optional()),
  query: optionalText,
  from: optionalDate,
  to: optionalDate,
});

export class AdminOrderFilterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminOrderFilterError";
  }
}

export type AdminOrderFilters = z.infer<typeof filterSchema>;

export function parseAdminOrderFilters(input: Record<string, string | string[] | undefined>): AdminOrderFilters {
  const parsed = filterSchema.safeParse({
    page: value(input.page),
    storeId: value(input.storeId),
    status: value(input.status),
    query: value(input.query),
    from: value(input.from),
    to: value(input.to),
  });

  if (!parsed.success) throw new AdminOrderFilterError(parsed.error.issues[0]?.message ?? "The order filters are invalid.");

  const filters = parsed.data;
  if (filters.from && filters.to && filters.from > filters.to) {
    throw new AdminOrderFilterError("The start date must be on or before the end date.");
  }

  if (filters.from && filters.to) {
    const days = (ethiopiaDayStart(filters.to).getTime() - ethiopiaDayStart(filters.from).getTime()) / 86_400_000;
    if (days > 92) throw new AdminOrderFilterError("Choose a date range of 93 days or fewer.");
  }

  return filters;
}

function value(item: string | string[] | undefined) {
  return Array.isArray(item) ? item[0] : item;
}

function ethiopiaDayStart(date: string) {
  return new Date(`${date}T00:00:00+03:00`);
}
