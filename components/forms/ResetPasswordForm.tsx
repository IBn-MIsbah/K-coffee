"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setError("This reset link is invalid or has expired.");
    if (password.length < 8) return setError("Use at least 8 characters for your new password.");
    if (password !== confirmPassword) return setError("The passwords do not match.");
    setSubmitting(true);
    setError("");
    try {
      const result = await resetPassword({ newPassword: password, token });
      if (result.error) return setError("This reset link is invalid or has expired. Request a new link to continue.");
      setComplete(true);
    } catch {
      setError("This reset link is invalid or has expired. Request a new link to continue.");
    } finally {
      setSubmitting(false);
    }
  }

  return <section className="rounded-2xl bg-white p-8 shadow-xl"><h1 className="text-3xl font-bold text-gray-900">Choose a new password</h1>{complete ? <p role="status" className="mt-6 rounded-lg bg-green-50 p-3 text-sm text-green-800">Your password has been reset. You can now sign in.</p> : <form onSubmit={submit} className="mt-7 space-y-5"><Field><FieldLabel htmlFor="password">New password</FieldLabel><Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></Field><Field><FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel><Input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></Field>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}<Button type="submit" disabled={submitting} className="min-h-11 w-full bg-amber-600 hover:bg-amber-700">{submitting ? "Resetting…" : "Reset password"}</Button></form>}<Link href="/login" className="mt-6 block text-center text-sm font-semibold text-amber-800 underline">Back to sign in</Link></section>;
}
