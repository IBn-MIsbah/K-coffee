import { type Prisma } from "@/app/generated/prisma/client";

const sensitiveKey = /password|token|secret|authorization|cookie|session|payment|card|bank|credential|hash|ip.?address|user.?agent/i;

export type SafeAuditDetail = { label: string; value: string };

export function toSafeAuditDetails(details: Prisma.JsonValue | null): SafeAuditDetail[] {
  if (!details || Array.isArray(details) || typeof details !== "object") return [];

  return Object.entries(details)
    .map(([key, value]) => ({ label: labelFor(key), value: sensitiveKey.test(key) ? "Redacted" : formatValue(value) }))
    .filter((detail) => detail.value !== "Not displayed");
}

function formatValue(value: Prisma.JsonValue | undefined, depth = 0): string {
  if (value === undefined) return "Not displayed";
  if (value === null) return "None";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value.length <= 300 ? value : "Not displayed";
  if (depth >= 1) return "Not displayed";
  if (Array.isArray(value)) return value.length <= 20 ? value.map((item) => formatValue(item, depth + 1)).join(", ") : "Not displayed";

  const entries = Object.entries(value).filter(([key]) => !sensitiveKey.test(key));
  if (!entries.length || entries.length > 12) return "Not displayed";
  return entries.map(([key, item]) => `${labelFor(key)}: ${formatValue(item, depth + 1)}`).join(" · ");
}

function labelFor(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
