import { describe, expect, it } from "vitest";
import { getDefaultStoreId, parseProfileUpdate, ProfileValidationError } from "@/lib/account/profile-validation";

describe("profile pickup preferences", () => {
  it("accepts a nullable default store and trims profile fields", () => {
    expect(parseProfileUpdate({ name: "  Hana  ", phone: "  +251911000000 ", defaultStoreId: "store-bole" })).toEqual({ name: "Hana", phone: "+251911000000", defaultStoreId: "store-bole" });
    expect(parseProfileUpdate({ name: "Hana", phone: "", defaultStoreId: null }).defaultStoreId).toBeNull();
    expect(parseProfileUpdate({ name: "Hana", phone: "", defaultStoreId: "" }).defaultStoreId).toBeNull();
  });

  it("rejects malformed profile preferences", () => {
    expect(() => parseProfileUpdate({ name: "H", phone: "", defaultStoreId: "" })).toThrow(ProfileValidationError);
  });

  it("reads only a valid string default store from existing preferences", () => {
    expect(getDefaultStoreId({ defaultStoreId: "store-bole", marketingEmailOptIn: true })).toBe("store-bole");
    expect(getDefaultStoreId({ defaultStoreId: 4 })).toBeNull();
    expect(getDefaultStoreId(null)).toBeNull();
  });
});
