import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    notificationDelivery: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    appNotification: { create: vi.fn() },
  };
  const prisma = {
    order: { findUnique: vi.fn() },
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    notificationDelivery: { update: vi.fn() },
  };

  return {
    prisma,
    sendOrderNotificationEmail: vi.fn(),
    tx,
  };
});

vi.mock("@/lib/prisma", () => ({ default: mocks.prisma }));
vi.mock("@/lib/email", () => ({
  sendOrderNotificationEmail: mocks.sendOrderNotificationEmail,
}));
vi.mock("server-only", () => ({}));

import { notifyOrderCustomer } from "@/lib/notifications/order-notification-service";

const order = {
  id: "order-1",
  orderNumber: "KC-1001",
  userId: "customer-1",
  user: { email: "customer@k-coffee.test" },
};

describe("order notification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.order.findUnique.mockResolvedValue(order);
    mocks.tx.notificationDelivery.findUnique.mockResolvedValue(null);
    mocks.tx.appNotification.create.mockResolvedValue({ id: "notification-1" });
    mocks.tx.notificationDelivery.create.mockResolvedValue({ id: "delivery-1" });
    mocks.prisma.notificationDelivery.update.mockResolvedValue({ id: "delivery-1" });
    mocks.sendOrderNotificationEmail.mockResolvedValue(undefined);
  });

  it("persists an in-app update and sends one transactional order email", async () => {
    await notifyOrderCustomer("order-1", "ORDER_READY");

    expect(mocks.tx.appNotification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "customer-1",
        orderId: "order-1",
        event: "ORDER_READY",
        title: "Ready for pickup",
        href: "/dashboard/orders/order-1",
      }),
    });
    expect(mocks.sendOrderNotificationEmail).toHaveBeenCalledWith(
      "customer@k-coffee.test",
      "Your K-Coffee order is ready",
      expect.stringContaining("KC-1001"),
    );
    expect(mocks.prisma.notificationDelivery.update).toHaveBeenCalledWith({
      where: {
        orderId_event_channel: {
          orderId: "order-1",
          event: "ORDER_READY",
          channel: "EMAIL",
        },
      },
      data: expect.objectContaining({ status: "SENT", sentAt: expect.any(Date) }),
    });
  });

  it("does not send or create a duplicate delivery for an already-recorded event", async () => {
    mocks.tx.notificationDelivery.findUnique.mockResolvedValue({ id: "delivery-1" });

    await notifyOrderCustomer("order-1", "ORDER_RECEIVED");

    expect(mocks.tx.appNotification.create).not.toHaveBeenCalled();
    expect(mocks.tx.notificationDelivery.create).not.toHaveBeenCalled();
    expect(mocks.sendOrderNotificationEmail).not.toHaveBeenCalled();
  });

  it("records a failed provider attempt without throwing to the order workflow", async () => {
    mocks.sendOrderNotificationEmail.mockRejectedValue(new Error("Gmail unavailable"));

    await expect(notifyOrderCustomer("order-1", "ORDER_CANCELLED")).resolves.toBeUndefined();

    expect(mocks.prisma.notificationDelivery.update).toHaveBeenCalledWith({
      where: {
        orderId_event_channel: {
          orderId: "order-1",
          event: "ORDER_CANCELLED",
          channel: "EMAIL",
        },
      },
      data: expect.objectContaining({ status: "FAILED", errorCode: "Error" }),
    });
  });
});
