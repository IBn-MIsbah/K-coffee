import LoginForm from "@/components/forms/LoginForm";
import { auth } from "@/lib/auth";
import { safeReturnTo } from "@/lib/return-to";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login | K-Coffee",
};

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[]; returnTo?: string | string[] }>;
}) => {
  const [{ callbackUrl, returnTo }, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
  ]);
  const requestedDestination = callbackUrl ?? returnTo;
  const destination = safeReturnTo(
    Array.isArray(requestedDestination) ? requestedDestination[0] : requestedDestination
  );

  if (session?.user) {
    redirect(destination);
  }

  return <LoginForm returnTo={destination} />;
};

export default LoginPage;
