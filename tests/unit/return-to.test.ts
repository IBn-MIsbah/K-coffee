import { describe, expect, it } from "vitest";
import { loginUrlFor, safeReturnTo } from "@/lib/return-to";

describe("safeReturnTo", () => {
  it("allows known internal protected routes", () => {
    expect(safeReturnTo("/cart")).toBe("/cart");
    expect(safeReturnTo("/checkout")).toBe("/checkout");
    expect(safeReturnTo("/dashboard/orders/order_123")).toBe("/dashboard/orders/order_123");
    expect(safeReturnTo("/orders/order_123")).toBe("/orders/order_123");
    expect(safeReturnTo(`/staff/accept?token=${"a".repeat(32)}`)).toBe(`/staff/accept?token=${"a".repeat(32)}`);
  });

  it("drops query values until they are explicitly supported", () => {
    expect(safeReturnTo("/checkout?coupon=not-supported")).toBe("/checkout");
  });

  it("rejects external, malformed, and unsupported targets", () => {
    for (const value of ["https://attacker.example", "//attacker.example", "javascript:alert(1)", "\\\\attacker.example", "/menu", " "]) {
      expect(safeReturnTo(value)).toBe("/dashboard");
    }
  });

  it("creates login URLs from only safe targets", () => {
    expect(loginUrlFor("/cart")).toBe("/login?callbackUrl=%2Fcart");
    expect(loginUrlFor("https://attacker.example")).toBe("/login?callbackUrl=%2Fdashboard");
    expect(loginUrlFor(`/staff/accept?token=${"a".repeat(32)}`)).toBe(`/login?callbackUrl=${encodeURIComponent(`/staff/accept?token=${"a".repeat(32)}`)}`);
  });
});
