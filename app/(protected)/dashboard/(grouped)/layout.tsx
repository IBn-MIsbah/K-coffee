import AppSidebar from "@/components/DashboardGrouped/AppSidebar";
import DashboardHeader from "@/components/DashboardGrouped/DashboardHeader";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";
import { headers } from "next/headers";

export default async function EditorsDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = session?.user?.role;
  const unreadNotificationCount =
    userRole === UserRole.USER && session?.user?.id
      ? await prisma.appNotification.count({
          where: { userId: session.user.id, readAt: null },
        })
      : 0;

  return (
    <div className="flex min-h-dvh min-w-full bg-[#f7f1e6]">
      {/* Pass the role to the sidebar */}
      <AppSidebar
        role={userRole}
        name={session?.user?.name}
        unreadNotificationCount={unreadNotificationCount}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
