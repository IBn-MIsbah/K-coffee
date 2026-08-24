"use client";

import Link from "next/link";
import { CheckCircle2, MailCheck, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import AuthPageHeader from "@/components/auth/AuthPageHeader";
import { Button } from "@/components/ui/button";
import { sendVerificationEmail } from "@/lib/auth-client";

type VerifyEmailCardProps = {
  email: string | null;
  verified: boolean;
  returnTo: string;
};

export default function VerifyEmailCard({ email, verified, returnTo }: VerifyEmailCardProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const loginHref = `/login?callbackUrl=${encodeURIComponent(returnTo)}`;

  async function resend() {
    if (!email) return;
    setSending(true);
    setMessage("");

    try {
      const callbackUrl = new URL("/verify-email", window.location.origin);
      callbackUrl.searchParams.set("returnTo", returnTo);
      const result = await sendVerificationEmail({ email, callbackURL: callbackUrl.toString() });
      const nextMessage = result.error
        ? "We could not send a new link. Please wait a moment and try again."
        : "A new verification link has been sent. Check your inbox and spam folder.";
      setMessage(nextMessage);
      if (result.error) toast.error(nextMessage); else toast.success("A new verification email has been sent.");
    } catch {
      const nextMessage = "We could not send a new link. Please wait a moment and try again.";
      setMessage(nextMessage);
      toast.error(nextMessage);
    } finally {
      setSending(false);
    }
  }

  if (!email) {
    return (
      <div className="space-y-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200"><MailCheck aria-hidden="true" className="size-6" /></div>
        <AuthPageHeader eyebrow="Email verification" title="Sign in to check your email status" description="Your verification link has been processed. Sign in to view your account status or request another email." className="text-left" />
        <Button asChild className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white hover:bg-[#663115] dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300">
          <Link href={loginHref}>Sign in</Link>
        </Button>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="space-y-8">
        <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"><CheckCircle2 aria-hidden="true" className="size-6" /></div>
        <AuthPageHeader eyebrow="Email verified" title="Your account is ready" description="Your email address has been confirmed. You can now continue with K-Coffee." />
        <Button asChild className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white hover:bg-[#663115] dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300">
          <Link href={returnTo}>Continue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200"><MailCheck aria-hidden="true" className="size-6" /></div>
      <AuthPageHeader eyebrow="One more step" title="Verify your email" description="Open the verification link we sent to the address below. It helps keep your account recoverable and secure." />
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-100">
        Sent to <span className="font-semibold break-all">{email}</span>
      </div>
      <div className="space-y-3">
        <Button type="button" onClick={resend} disabled={sending} variant="outline" className="h-12 w-full rounded-xl border-amber-300 bg-transparent text-amber-950 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/60">
          <RefreshCw aria-hidden="true" className={sending ? "size-4 animate-spin" : "size-4"} /> {sending ? "Sending another link…" : "Resend verification link"}
        </Button>
        {message ? <p role="status" className="rounded-xl bg-stone-100 px-4 py-3 text-sm leading-6 text-stone-700 dark:bg-stone-800 dark:text-stone-200">{message}</p> : null}
        <Button asChild variant="ghost" className="h-11 w-full rounded-xl text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
          <Link href={returnTo}>Continue without verifying</Link>
        </Button>
      </div>
    </div>
  );
}
