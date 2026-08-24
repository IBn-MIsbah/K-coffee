import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/forms/RegisterForm";
import { auth } from "@/lib/auth";
import { safeReturnTo } from "@/lib/return-to";

export const metadata: Metadata = { title: "Create account | K-Coffee" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[]; returnTo?: string | string[] }>;
}) {
  const [{ callbackUrl, returnTo }, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
  ]);
  const requestedDestination = callbackUrl ?? returnTo;
  const destination = safeReturnTo(
    Array.isArray(requestedDestination) ? requestedDestination[0] : requestedDestination,
  );

  if (session?.user) redirect(destination);

  return <RegisterForm returnTo={destination} />;
}
