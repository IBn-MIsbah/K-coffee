import { describe, expect, it } from "vitest";
import { parseStoreInput, StoreValidationError } from "@/lib/admin/store-validation";

const validStore = {
  name: "K-Coffee Bole",
  address: "Bole Road, Addis Ababa",
  phone: "+251 911 000 000",
  timezone: "Africa/Addis_Ababa",
  pickupIntervalMinutes: 20,
  pickupLeadTimeMinutes: 20,
  pickupCapacity: 10,
  coordinates: null,
  hours: {
    mon: { open: "07:00", close: "19:00" }, tue: { open: "07:00", close: "19:00" },
    wed: { open: "07:00", close: "19:00" }, thu: { open: "07:00", close: "19:00" },
    fri: { open: "07:00", close: "19:00" }, sat: { open: "07:00", close: "19:00" },
    sun: { open: null, close: null },
  },
};

describe("parseStoreInput", () => {
  it("normalizes a complete Addis Ababa store configuration", () => {
    expect(parseStoreInput({ ...validStore, name: "  K-Coffee Bole  " })).toMatchObject({
      name: "K-Coffee Bole", timezone: "Africa/Addis_Ababa", hours: { sun: { open: null, close: null } },
    });
  });

  it("rejects invalid hours, timezone, and pickup intervals", () => {
    expect(() => parseStoreInput({ ...validStore, hours: { ...validStore.hours, mon: { open: "19:00", close: "07:00" } } })).toThrow(StoreValidationError);
    expect(() => parseStoreInput({ ...validStore, timezone: "UTC" })).toThrow(StoreValidationError);
    expect(() => parseStoreInput({ ...validStore, pickupIntervalMinutes: 30 })).toThrow(StoreValidationError);
  });
});
