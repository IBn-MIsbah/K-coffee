import { requirePageSession } from "@/lib/authz";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The proxy preserves the original protected route. This remains a safe
  // fallback for deployments where the proxy is not invoked.
  await requirePageSession();

  return <>{children}</>;
}
