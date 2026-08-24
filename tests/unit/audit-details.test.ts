import { describe, expect, it } from "vitest";
import { toSafeAuditDetails } from "@/lib/audit-details";

describe("safe audit details", () => {
  it("keeps concise operational values while redacting secrets", () => {
    expect(toSafeAuditDetails({ before: "PENDING", after: "CONFIRMED", token: "secret", nested: { reason: "Store confirmed" } })).toEqual([
      { label: "Before", value: "PENDING" }, { label: "After", value: "CONFIRMED" }, { label: "Token", value: "Redacted" }, { label: "Nested", value: "Reason: Store confirmed" },
    ]);
  });
});
