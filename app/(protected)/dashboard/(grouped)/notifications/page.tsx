import { requirePageRole } from "@/lib/authz";
import { listCustomerNotifications } from "@/lib/notifications/customer-notification-service";
import { UserRole } from "@/lib/rbac";
import { Bell } from "lucide-react";
import NotificationList from "./notification-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const actor = await requirePageRole([UserRole.USER], "/dashboard/notifications");
  const notifications = await listCustomerNotifications(actor);
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <section className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl bg-[#3b2116] px-6 py-8 text-[#fff9ee] shadow-[0_18px_45px_rgba(60,32,17,.18)] sm:px-8 sm:py-10">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f4bd4d]">Customer updates</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">Notifications</h1>
            <p className="mt-3 max-w-2xl text-[#e9ca9e]">Order confirmations, pickup-ready updates, and cancellations appear here.</p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f4bd4d] text-[#3b2116]">
            <Bell aria-hidden="true" className="size-6" />
          </span>
        </div>
        {unreadCount > 0 && <p className="mt-6 inline-flex rounded-full bg-[#5a3421] px-3 py-1 text-sm font-bold text-[#ffe4a6]">{unreadCount} unread {unreadCount === 1 ? "update" : "updates"}</p>}
      </header>

      <div className="mt-7">
        <NotificationList notifications={notifications.map((notification) => ({ ...notification, readAt: notification.readAt?.toISOString() ?? null, createdAt: notification.createdAt.toISOString() }))} />
      </div>
    </section>
  );
}
