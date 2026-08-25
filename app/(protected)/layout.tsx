import { requirePageSession } from "@/lib/authz";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The proxy preserves the original protected route. This remains a safe
  // fallback for deployments where the proxy is not invoked.
  await requirePageSession();

  // SidebarProvider is a flex container at the application root. This wrapper
  // makes every protected route claim the available width, including commerce
  // routes that do not render the dashboard sidebar.
  return <div className="flex min-h-svh min-w-0 flex-1 flex-col">{children}</div>;
}
