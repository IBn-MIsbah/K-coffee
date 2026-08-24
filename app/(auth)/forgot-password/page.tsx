import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import { safeReturnTo } from "@/lib/return-to";

export const metadata = { title: "Reset password | K-Coffee" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[]; returnTo?: string | string[] }>;
}) {
  const { callbackUrl, returnTo } = await searchParams;
  const requestedDestination = callbackUrl ?? returnTo;
  const destination = safeReturnTo(
    Array.isArray(requestedDestination) ? requestedDestination[0] : requestedDestination,
  );

  return <ForgotPasswordForm returnTo={destination} />;
}
