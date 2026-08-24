import { UserRole } from "@/app/generated/prisma/client";
import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1, "Enter at least one character.").max(100, "Use 100 characters or fewer.").optional(),
);
const optionalDate = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.").optional(),
);

const auditFilterSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  actor: optionalText,
  role: z.preprocess((value) => (value === "" ? undefined : value), z.nativeEnum(UserRole).optional()),
  resource: optionalText,
  action: optionalText,
  from: optionalDate,
  to: optionalDate,
});

export class AuditFilterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditFilterError";
  }
}

export type AuditFilters = z.infer<typeof auditFilterSchema>;

export function parseAuditFilters(input: Record<string, string | string[] | undefined>): AuditFilters {
  const parsed = auditFilterSchema.safeParse({
    page: value(input.page), actor: value(input.actor), role: value(input.role), resource: value(input.resource),
    action: value(input.action), from: value(input.from), to: value(input.to),
  });
  if (!parsed.success) throw new AuditFilterError(parsed.error.issues[0]?.message ?? "The audit filters are invalid.");

  const filters = parsed.data;
  if (filters.from && filters.to && filters.from > filters.to) throw new AuditFilterError("The start date must be on or before the end date.");
  if (filters.from && filters.to) {
    const days = (ethiopiaDayStart(filters.to).getTime() - ethiopiaDayStart(filters.from).getTime()) / 86_400_000;
    if (days > 92) throw new AuditFilterError("Choose a date range of 93 days or fewer.");
  }
  return filters;
}

function value(item: string | string[] | undefined) { return Array.isArray(item) ? item[0] : item; }
function ethiopiaDayStart(date: string) { return new Date(`${date}T00:00:00+03:00`); }
