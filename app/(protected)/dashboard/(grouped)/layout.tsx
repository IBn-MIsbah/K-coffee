import AppSidebar from "@/components/DashboardGrouped/AppSidebar";
import DashboardHeader from "@/components/DashboardGrouped/DashboardHeader";
import PageTransition from "@/components/DashboardGrouped/PageTransition";
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
    <div className="relative flex min-h-dvh min-w-full overflow-hidden bg-[#f4eadb]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-20 size-96 rounded-full bg-[#f4bd4d]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 bottom-0 size-[32rem] rounded-full bg-[#9b5b30]/15 blur-3xl" />
      {/* Pass the role to the sidebar */}
      <AppSidebar
        role={userRole}
        name={session?.user?.name}
        unreadNotificationCount={unreadNotificationCount}
      />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8"><PageTransition>{children}</PageTransition></main>
      </div>
    </div>
  );
}
