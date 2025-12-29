import AppSidebar from "@/components/DashboardGrouped/AppSidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
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

  return (
    <div className="flex min-h-screen min-w-full">
      {/* Pass the role to the sidebar */}
      <AppSidebar role={userRole} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <SidebarTrigger />
          <Breadcrumb />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
