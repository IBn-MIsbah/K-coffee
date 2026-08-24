import VerifyEmailCard from "@/components/forms/VerifyEmailCard";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { safeReturnTo } from "@/lib/return-to";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify email | K-Coffee" };

export default async function VerifyEmailPage({
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
  const email = session?.user?.email ?? null;
  const user = email
    ? await prisma.user.findUnique({ where: { email }, select: { emailVerified: true } })
    : null;

  return <VerifyEmailCard email={email} verified={user?.emailVerified === true} returnTo={destination} />;
}
