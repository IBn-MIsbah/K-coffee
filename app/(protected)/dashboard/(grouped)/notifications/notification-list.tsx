"use client";

import { Button } from "@/components/ui/button";
import { Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type CustomerNotification = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export default function NotificationList({
  notifications,
}: {
  notifications: CustomerNotification[];
}) {
  const router = useRouter();
  const [readingId, setReadingId] = useState<string | null>(null);

  async function markRead(notificationId: string) {
    setReadingId(notificationId);
    try {
      const response = await fetch(
        `/api/account/notifications/${notificationId}/read`,
        { method: "PATCH" },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to update this notification.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update this notification.");
    } finally {
      setReadingId(null);
    }
  }

  if (!notifications.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#dfc6a9] bg-white p-7 text-sm leading-6 text-[#725b4c]">
        You&apos;re all caught up. Updates about your pickup orders will appear here.
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-3xl border border-[#ead9bf] bg-white shadow-sm">
      {notifications.map((notification) => {
        const unread = !notification.readAt;
        const time = new Intl.DateTimeFormat("en-ET", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Africa/Addis_Ababa",
        }).format(new Date(notification.createdAt));

        return (
          <li
            key={notification.id}
            className="flex flex-col gap-4 border-b border-[#ead9bf] p-5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:p-6"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {unread && <span className="size-2 rounded-full bg-[#b56527]" aria-label="Unread" />}
                <h2 className="font-extrabold text-[#2c1911]">{notification.title}</h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#725b4c]">{notification.body}</p>
              <p className="mt-2 text-xs font-semibold text-[#8a654d]">{time}</p>
              {notification.href && (
                <Link
                  href={notification.href}
                  className="mt-4 inline-flex min-h-11 items-center font-bold text-[#7d4018] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#934817]"
                >
                  View order
                </Link>
              )}
            </div>
            {unread && (
              <Button
                variant="outline"
                className="min-h-11 shrink-0 rounded-xl border-[#c9853c] text-[#6d3514] hover:bg-[#f7ebd8] hover:text-[#3b2116]"
                onClick={() => markRead(notification.id)}
                disabled={readingId === notification.id}
              >
                {readingId === notification.id ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Check aria-hidden="true" className="size-4" />
                )}
                Mark as read
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
