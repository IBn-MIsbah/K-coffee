const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type StoreDayHours = { open: string; close: string } | { open: null; close: null };
export type StoreHours = Record<(typeof dayKeys)[number], StoreDayHours>;

export type StoreInput = {
  name: string;
  address: string;
  phone: string;
  hours: StoreHours;
  timezone: "Africa/Addis_Ababa";
  pickupIntervalMinutes: number;
  pickupLeadTimeMinutes: number;
  pickupCapacity: number;
  coordinates: string | null;
};

export class StoreValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreValidationError";
  }
}

function record(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new StoreValidationError(`${field} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string, maximum: number, minimum = 1) {
  if (typeof value !== "string") throw new StoreValidationError(`${field} is required.`);
  const trimmed = value.trim();
  if (trimmed.length < minimum || trimmed.length > maximum) {
    throw new StoreValidationError(`${field} must be between ${minimum} and ${maximum} characters.`);
  }
  return trimmed;
}

function integer(value: unknown, field: string, minimum: number, maximum: number) {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new StoreValidationError(`${field} must be a whole number between ${minimum} and ${maximum}.`);
  }
  return value as number;
}

function minutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour < 24 && minute < 60 ? hour * 60 + minute : null;
}

function parseDayHours(value: unknown, day: string): StoreDayHours {
  const hours = record(value, `${day} hours`);
  const keys = Object.keys(hours);
  if (keys.length !== 2 || !keys.includes("open") || !keys.includes("close")) {
    throw new StoreValidationError(`${day} hours must contain only open and close values.`);
  }

  if (hours.open === null && hours.close === null) return { open: null, close: null };
  if (typeof hours.open !== "string" || typeof hours.close !== "string") {
    throw new StoreValidationError(`${day} opening and closing times must both be HH:mm, or both be closed.`);
  }

  const open = minutes(hours.open);
  const close = minutes(hours.close);
  if (open === null || close === null || open >= close) {
    throw new StoreValidationError(`${day} opening hours are invalid.`);
  }
  return { open: hours.open, close: hours.close };
}

function parseHours(value: unknown): StoreHours {
  const hours = record(value, "hours");
  const keys = Object.keys(hours);
  if (keys.length !== dayKeys.length || dayKeys.some((day) => !keys.includes(day))) {
    throw new StoreValidationError("hours must define every day from Monday through Sunday.");
  }

  return Object.fromEntries(dayKeys.map((day) => [day, parseDayHours(hours[day], day)])) as StoreHours;
}

export function parseStoreInput(value: unknown): StoreInput {
  const input = record(value, "store");
  const allowed = new Set(["name", "address", "phone", "hours", "timezone", "pickupIntervalMinutes", "pickupLeadTimeMinutes", "pickupCapacity", "coordinates"]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    throw new StoreValidationError("The store request contains an unsupported field.");
  }

  const phone = text(input.phone, "phone", 32, 7);
  if (!/^[+\d()\s-]+$/.test(phone)) throw new StoreValidationError("phone contains unsupported characters.");
  if (input.timezone !== "Africa/Addis_Ababa") {
    throw new StoreValidationError("timezone must be Africa/Addis_Ababa.");
  }

  const pickupIntervalMinutes = integer(input.pickupIntervalMinutes, "pickupIntervalMinutes", 20, 120);
  if (pickupIntervalMinutes % 20 !== 0) {
    throw new StoreValidationError("pickupIntervalMinutes must be a multiple of 20 minutes.");
  }

  const coordinates = input.coordinates === null || input.coordinates === undefined
    ? null
    : text(input.coordinates, "coordinates", 120);

  return {
    name: text(input.name, "name", 120),
    address: text(input.address, "address", 300),
    phone,
    hours: parseHours(input.hours),
    timezone: "Africa/Addis_Ababa",
    pickupIntervalMinutes,
    pickupLeadTimeMinutes: integer(input.pickupLeadTimeMinutes, "pickupLeadTimeMinutes", 0, 240),
    pickupCapacity: integer(input.pickupCapacity, "pickupCapacity", 1, 200),
    coordinates,
  };
}
