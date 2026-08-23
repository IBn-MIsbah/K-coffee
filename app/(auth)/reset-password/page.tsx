import { Suspense } from "react";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

export const metadata = { title: "Choose a new password | K-Coffee" };

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>;
}
