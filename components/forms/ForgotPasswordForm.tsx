"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // Keep the response indistinguishable from a successful request.
    } finally {
      // This confirmation is deliberately identical whether or not the
      // address exists, preventing account enumeration.
      setSubmitted(true);
      setSubmitting(false);
    }
  }

  return <section className="rounded-2xl bg-white p-8 shadow-xl"><h1 className="text-3xl font-bold text-gray-900">Reset your password</h1><p className="mt-2 text-gray-600">Enter your email and we&apos;ll send a reset link if an account is available.</p>{submitted ? <p role="status" className="mt-6 rounded-lg bg-green-50 p-3 text-sm text-green-800">If an account matches this address, a reset link is on its way.</p> : <form onSubmit={submit} className="mt-7 space-y-5"><Field><FieldLabel htmlFor="email">Email address</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></Field><Button type="submit" disabled={submitting} className="min-h-11 w-full bg-amber-600 hover:bg-amber-700">{submitting ? "Sending…" : "Send reset link"}</Button></form>}<Link href="/login" className="mt-6 block text-center text-sm font-semibold text-amber-800 underline">Back to sign in</Link></section>;
}
