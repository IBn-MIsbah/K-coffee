import "server-only";

import { NotificationEvent, Prisma } from "@/app/generated/prisma/client";
import { type AuthenticatedActor } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { notifyOrderCustomer } from "@/lib/notifications/order-notification-service";

export const VAT_RATE = new Prisma.Decimal("0.15");
export const ORDER_CURRENCY = "ETB";

type PickupInput = {
  storeId: string;
  pickupTime: string;
  idempotencyKey: string;
  notes?: string;
  items: Array<{ productId: string; quantity: number }>;
};

export class CheckoutValidationError extends Error {}

const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function ethiopianTime(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return { weekday: value("weekday").toLowerCase().slice(0, 3), hour: Number(value("hour")), minute: Number(value("minute")) };
}

function asMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
}

export async function createPickupOrder(actor: AuthenticatedActor, input: PickupInput) {
  if (!input.storeId || !input.idempotencyKey || input.idempotencyKey.length > 128) {
    throw new CheckoutValidationError("Your checkout request is invalid. Please try again.");
  }
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 30) {
    throw new CheckoutValidationError("Your cart must contain between 1 and 30 products.");
  }

  const quantities = new Map<string, number>();
  for (const item of input.items) {
    if (!item?.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new CheckoutValidationError("One or more item quantities are invalid.");
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  const pickupTime = new Date(input.pickupTime);
  if (Number.isNaN(pickupTime.getTime())) throw new CheckoutValidationError("Choose a valid pickup time.");

  const existing = await prisma.order.findFirst({
    where: { userId: actor.id, idempotencyKey: input.idempotencyKey },
    select: { id: true, orderNumber: true },
  });
  if (existing) return { ...existing, reused: true };

  const store = await prisma.storeLocation.findFirst({ where: { id: input.storeId, isActive: true } });
  if (!store) throw new CheckoutValidationError("That pickup location is unavailable.");
  if (pickupTime.getTime() < Date.now() + store.pickupLeadTimeMinutes * 60_000) {
    throw new CheckoutValidationError(`Choose a time at least ${store.pickupLeadTimeMinutes} minutes from now.`);
  }

  const local = ethiopianTime(pickupTime, store.timezone);
  const dayHours = (store.hours as Record<string, { open?: string; close?: string }>)[weekdayKeys.find((day) => day === local.weekday) ?? ""];
  const open = asMinutes(dayHours?.open ?? "");
  const close = asMinutes(dayHours?.close ?? "");
  const pickupMinutes = local.hour * 60 + local.minute;
  if (open === null || close === null || pickupMinutes < open || pickupMinutes >= close || (pickupMinutes - open) % store.pickupIntervalMinutes !== 0) {
    throw new CheckoutValidationError(`Choose an available ${store.pickupIntervalMinutes}-minute pickup slot during local opening hours.`);
  }

  const concurrentOrders = await prisma.order.count({
    where: { storeId: store.id, pickupTime, status: { not: "CANCELLED" } },
  });
  if (concurrentOrders >= store.pickupCapacity) throw new CheckoutValidationError("That pickup slot is full. Choose another time.");

  const products = await prisma.product.findMany({ where: { id: { in: [...quantities.keys()] }, isActive: true, category: { isActive: true } } });
  if (products.length !== quantities.size) throw new CheckoutValidationError("One or more products are no longer available.");

  const subtotal = products.reduce((sum, product) => sum.add(product.price.mul(quantities.get(product.id) ?? 0)), new Prisma.Decimal(0));
  const tax = subtotal.mul(VAT_RATE).toDecimalPlaces(2);
  const total = subtotal.add(tax).toDecimalPlaces(2);
  const orderNumber = `KC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      userId: actor.id,
      storeId: store.id,
      orderNumber,
      pickupTime,
      subtotalAmount: subtotal.toDecimalPlaces(2),
      taxAmount: tax,
      totalAmount: total,
      currency: ORDER_CURRENCY,
      notes: input.notes?.trim().slice(0, 500) || null,
      idempotencyKey: input.idempotencyKey,
      items: { create: products.map((product) => ({ productId: product.id, quantity: quantities.get(product.id) ?? 0, price: product.price })) },
    },
    select: { id: true, orderNumber: true },
  });
  await notifyOrderCustomer(order.id, NotificationEvent.ORDER_RECEIVED);
  return { ...order, reused: false };
}
