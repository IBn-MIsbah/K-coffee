import "server-only";

import { NotificationEvent } from "@/app/generated/prisma/client";
import { sendOrderNotificationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";

const messages: Record<NotificationEvent, { title: string; subject: string; body: (number: string) => string }> = {
  ORDER_RECEIVED: { title: "Order received", subject: "K-Coffee order received", body: (number) => `Your pickup order ${number} has been received. Payment is collected at pickup.` },
  ORDER_READY: { title: "Ready for pickup", subject: "Your K-Coffee order is ready", body: (number) => `Your pickup order ${number} is ready for collection.` },
  ORDER_CANCELLED: { title: "Order cancelled", subject: "Your K-Coffee order was cancelled", body: (number) => `Your pickup order ${number} was cancelled. No payment is due.` },
};

/** Persists the in-app message before attempting Gmail; mail failure never throws. */
export async function notifyOrderCustomer(orderId: string, event: NotificationEvent) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, orderNumber: true, userId: true, user: { select: { email: true } } } });
  if (!order?.userId) return;
  const message = messages[event];
  const href = `/dashboard/orders/${order.id}`;
  const recipient = order.user?.email;

  const queued = await prisma.$transaction(async (tx) => {
    const existing = await tx.notificationDelivery.findUnique({ where: { orderId_event_channel: { orderId: order.id, event, channel: "EMAIL" } }, select: { id: true } });
    if (existing) return false;
    await tx.appNotification.create({ data: { userId: order.userId!, orderId: order.id, event, title: message.title, body: message.body(order.orderNumber), href } });
    if (recipient) await tx.notificationDelivery.create({ data: { userId: order.userId!, orderId: order.id, event, recipient } });
    return Boolean(recipient);
  });
  if (!queued || !recipient) return;

  try {
    await sendOrderNotificationEmail(recipient, message.subject, `${message.body(order.orderNumber)}\n\nView your order: ${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}${href}`);
    await prisma.notificationDelivery.update({ where: { orderId_event_channel: { orderId: order.id, event, channel: "EMAIL" } }, data: { status: "SENT", attemptCount: { increment: 1 }, sentAt: new Date(), errorCode: null } });
  } catch (error) {
    await prisma.notificationDelivery.update({ where: { orderId_event_channel: { orderId: order.id, event, channel: "EMAIL" } }, data: { status: "FAILED", attemptCount: { increment: 1 }, errorCode: error instanceof Error ? error.name : "unknown" } }).catch(() => undefined);
  }
}
