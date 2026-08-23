"use client";

import Link from "next/link";
import { CheckCircle2, MailCheck, RefreshCw } from "lucide-react";
import { useState } from "react";
import { sendVerificationEmail } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function VerifyEmailCard({
  email,
  verified,
}: {
  email: string | null;
  verified: boolean;
}) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function resend() {
    if (!email) return;
    setSending(true);
    setMessage("");
    try {
      const result = await sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/verify-email`,
      });
      setMessage(result.error ? "We could not send a new link. Please try again shortly." : "A new verification link has been sent.");
    } catch {
      setMessage("We could not send a new link. Please try again shortly.");
    } finally {
      setSending(false);
    }
  }

  if (!email) {
    return <section className="rounded-2xl bg-white p-8 text-center shadow-xl"><MailCheck aria-hidden="true" className="mx-auto size-10 text-amber-700" /><h1 className="mt-5 text-3xl font-bold text-gray-900">Email verification</h1><p className="mt-3 text-gray-600">Your verification link has been processed. Sign in to view your account status.</p><Button asChild className="mt-7 min-h-11 bg-amber-600 hover:bg-amber-700"><Link href="/login">Sign in</Link></Button></section>;
  }

  return <section className="rounded-2xl bg-white p-8 text-center shadow-xl"><span className={`mx-auto grid size-12 place-items-center rounded-full ${verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{verified ? <CheckCircle2 aria-hidden="true" className="size-7" /> : <MailCheck aria-hidden="true" className="size-7" />}</span><h1 className="mt-5 text-3xl font-bold text-gray-900">{verified ? "Your email is verified" : "Verify your email"}</h1><p className="mt-3 text-gray-600">{verified ? "Your K-Coffee account is ready to use." : `We sent a verification link to ${email}. Open it to confirm your address.`}</p>{!verified && <Button type="button" onClick={resend} disabled={sending} variant="outline" className="mt-7 min-h-11 border-amber-300 text-amber-900 hover:bg-amber-50"><RefreshCw aria-hidden="true" className="size-4" /> {sending ? "Sending…" : "Resend verification link"}</Button>}{message && <p role="status" className="mt-4 text-sm text-gray-600">{message}</p>}<Link href="/dashboard" className="mt-6 block text-sm font-semibold text-amber-800 underline">Continue to your account</Link></section>;
}
