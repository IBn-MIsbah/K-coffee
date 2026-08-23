import { auth } from "@/lib/auth";
import VerifyEmailCard from "@/components/forms/VerifyEmailCard";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify email | K-Coffee" };

export default async function VerifyEmailPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email ?? null;
  const user = email
    ? await prisma.user.findUnique({ where: { email }, select: { emailVerified: true } })
    : null;

  return <VerifyEmailCard email={email} verified={user?.emailVerified === true} />;
}
