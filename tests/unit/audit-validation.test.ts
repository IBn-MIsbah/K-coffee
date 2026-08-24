import { describe, expect, it } from "vitest";
import { AuditFilterError, parseAuditFilters } from "@/lib/audit-validation";

describe("audit filters", () => {
  it("normalizes empty fields and accepts bounded filters", () => {
    expect(parseAuditFilters({ page: "2", actor: "  Aster ", role: "ADMIN", resource: "", action: "update", from: "2026-08-01", to: "2026-08-23" })).toEqual({ page: 2, actor: "Aster", role: "ADMIN", action: "update", from: "2026-08-01", to: "2026-08-23" });
  });
  it("rejects unsupported roles, inverted dates, and excessive date ranges", () => {
    expect(() => parseAuditFilters({ role: "OWNER" })).toThrow(AuditFilterError);
    expect(() => parseAuditFilters({ from: "2026-08-23", to: "2026-08-01" })).toThrow("start date must be on or before");
    expect(() => parseAuditFilters({ from: "2026-01-01", to: "2026-05-01" })).toThrow("93 days or fewer");
  });
});
