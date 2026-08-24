"use client";

import Link from "next/link";
import { ArrowLeft, MailCheck, RefreshCw, Send } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import AuthPageHeader from "@/components/auth/AuthPageHeader";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth-client";
import { firstFieldErrors, forgotPasswordSchema, type FieldErrors } from "@/lib/auth-form-validation";

export default function ForgotPasswordForm({ returnTo }: { returnTo: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loginHref = `/login?callbackUrl=${encodeURIComponent(returnTo)}`;

  function focusField(field: string) {
    requestAnimationFrame(() => {
      const element = formRef.current?.elements.namedItem(field);
      if (element instanceof HTMLElement) element.focus();
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      const errors = firstFieldErrors(parsed.error);
      setFieldErrors(errors);
      focusField("email");
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const resetUrl = new URL("/reset-password", window.location.origin);
      resetUrl.searchParams.set("returnTo", returnTo);
      await requestPasswordReset({ email: parsed.data.email, redirectTo: resetUrl.toString() });
    } catch {
      // Keep this response indistinguishable from success to protect accounts from enumeration.
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("If that email has an account, a reset link is on its way.");
    }
  }

  if (submitted) {
    return (
      <div className="space-y-8">
        <div className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200">
          <MailCheck aria-hidden="true" className="size-6" />
        </div>
        <AuthPageHeader eyebrow="Check your inbox" title="Reset link requested" description="If an account matches this address, a password-reset link is on its way. For security, we use the same message for every request." />
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-100">
          Check your inbox and spam folder. The link will take you back here to choose a new password.
        </div>
        <div className="space-y-3">
          <Button type="button" variant="outline" onClick={() => setSubmitted(false)} className="h-12 w-full rounded-xl border-amber-300 bg-transparent text-amber-950 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/60">
            <RefreshCw aria-hidden="true" className="size-4" /> Send another link
          </Button>
          <Button asChild variant="ghost" className="h-11 w-full rounded-xl text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
            <Link href={loginHref}><ArrowLeft aria-hidden="true" className="size-4" /> Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AuthPageHeader title="Reset your password" description="Enter the email address on your account and we’ll send a secure reset link if one is available." />
      <form ref={formRef} noValidate onSubmit={submit} className="space-y-5">
        <Field data-invalid={Boolean(fieldErrors.email)}>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors({});
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "forgot-email-error" : undefined}
            className="h-12 rounded-xl border-stone-300 bg-white/80 px-4 text-base shadow-none placeholder:text-stone-400 focus-visible:border-amber-700 focus-visible:ring-amber-700/25 dark:border-stone-700 dark:bg-stone-950/40 dark:placeholder:text-stone-500"
          />
          <FieldError id="forgot-email-error">{fieldErrors.email}</FieldError>
        </Field>
        <Button type="submit" size="lg" disabled={submitting} className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white shadow-[0_10px_20px_rgba(124,63,29,0.2)] hover:bg-[#663115] dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300">
          {submitting ? <><RefreshCw aria-hidden="true" className="size-4 animate-spin" /> Sending reset link…</> : <><Send aria-hidden="true" className="size-4" /> Send reset link</>}
        </Button>
      </form>
      <div className="border-t border-stone-200 pt-6 dark:border-stone-800">
        <Button asChild variant="ghost" className="h-11 w-full rounded-xl text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
          <Link href={loginHref}><ArrowLeft aria-hidden="true" className="size-4" /> Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
