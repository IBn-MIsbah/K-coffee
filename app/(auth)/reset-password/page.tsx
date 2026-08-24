import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import { safeReturnTo } from "@/lib/return-to";

export const metadata = { title: "Choose a new password | K-Coffee" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[]; callbackUrl?: string | string[]; returnTo?: string | string[] }>;
}) {
  const { token, callbackUrl, returnTo } = await searchParams;
  const requestedDestination = callbackUrl ?? returnTo;
  const destination = safeReturnTo(
    Array.isArray(requestedDestination) ? requestedDestination[0] : requestedDestination,
  );
  const resetToken = Array.isArray(token) ? token[0] : token ?? null;

  return <ResetPasswordForm token={resetToken} returnTo={destination} />;
}
