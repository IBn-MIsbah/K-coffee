import { requirePageSession } from "@/lib/authz";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePageSession("/dashboard");

  return <>{children}</>;
}
