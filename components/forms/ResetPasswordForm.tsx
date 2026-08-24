"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import AuthPageHeader from "@/components/auth/AuthPageHeader";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth-client";
import { firstFieldErrors, resetPasswordSchema, type FieldErrors } from "@/lib/auth-form-validation";

type ResetPasswordFormProps = {
  token: string | null;
  returnTo: string;
};

export default function ResetPasswordForm({ token, returnTo }: ResetPasswordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const loginHref = `/login?callbackUrl=${encodeURIComponent(returnTo)}`;
  const forgotPasswordHref = `/forgot-password?callbackUrl=${encodeURIComponent(returnTo)}`;

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function focusField(field: string) {
    requestAnimationFrame(() => {
      const element = formRef.current?.elements.namedItem(field);
      if (element instanceof HTMLElement) element.focus();
    });
  }

  function showFormError(message: string) {
    setFormError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
    toast.error(message);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const errors = firstFieldErrors(parsed.error);
      setFieldErrors(errors);
      const firstField = Object.keys(errors)[0];
      if (firstField) focusField(firstField);
      return;
    }

    if (!token) return;

    setFieldErrors({});
    setSubmitting(true);
    try {
      const result = await resetPassword({ newPassword: parsed.data.password, token });
      if (result.error) {
        showFormError("This reset link is invalid or has expired. Request a new link to continue.");
        return;
      }
      setComplete(true);
      toast.success("Your password has been reset.");
    } catch {
      showFormError("This reset link is invalid or has expired. Request a new link to continue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-8">
        <div className="grid size-12 place-items-center rounded-2xl bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200"><KeyRound aria-hidden="true" className="size-6" /></div>
        <AuthPageHeader eyebrow="Reset link unavailable" title="This reset link is incomplete" description="Request a new password-reset link and open it from the same browser or email application." />
        <Button asChild className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white hover:bg-[#663115] dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300">
          <Link href={forgotPasswordHref}>Request a new link</Link>
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full rounded-xl text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
          <Link href={loginHref}><ArrowLeft aria-hidden="true" className="size-4" /> Back to sign in</Link>
        </Button>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="space-y-8">
        <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"><CheckCircle2 aria-hidden="true" className="size-6" /></div>
        <AuthPageHeader eyebrow="Password updated" title="You’re ready to sign in" description="Your password has been changed. Sign in with the new one to continue." />
        <Button asChild className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white hover:bg-[#663115] dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300">
          <Link href={loginHref}>Sign in with your new password</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AuthPageHeader title="Choose a new password" description="Use a password you do not reuse elsewhere. You can reveal each field while typing if you need to check it." />
      <form ref={formRef} noValidate onSubmit={submit} className="space-y-5">
        {formError ? (
          <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 outline-none dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
            {formError}
          </div>
        ) : null}

        <Field data-invalid={Boolean(fieldErrors.password)}>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => { setPassword(event.target.value); clearFieldError("password"); }}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "reset-password-error" : "reset-password-help"}
              className="h-12 rounded-xl border-stone-300 bg-white/80 px-4 pr-12 text-base shadow-none focus-visible:border-amber-700 focus-visible:ring-amber-700/25 dark:border-stone-700 dark:bg-stone-950/40"
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-0 top-0 grid size-12 place-items-center rounded-r-xl text-stone-500 transition-colors hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-amber-700 dark:text-stone-400 dark:hover:bg-amber-950/60 dark:hover:text-amber-200" aria-label={showPassword ? "Hide new password" : "Show new password"}>
              {showPassword ? <EyeOff aria-hidden="true" className="size-4.5" /> : <Eye aria-hidden="true" className="size-4.5" />}
            </button>
          </div>
          <FieldDescription id="reset-password-help">Use at least 8 characters. Password managers and paste are supported.</FieldDescription>
          <FieldError id="reset-password-error">{fieldErrors.password}</FieldError>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.confirmPassword)}>
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => { setConfirmPassword(event.target.value); clearFieldError("confirmPassword"); }}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? "reset-confirm-password-error" : undefined}
              className="h-12 rounded-xl border-stone-300 bg-white/80 px-4 pr-12 text-base shadow-none focus-visible:border-amber-700 focus-visible:ring-amber-700/25 dark:border-stone-700 dark:bg-stone-950/40"
            />
            <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-0 top-0 grid size-12 place-items-center rounded-r-xl text-stone-500 transition-colors hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-amber-700 dark:text-stone-400 dark:hover:bg-amber-950/60 dark:hover:text-amber-200" aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}>
              {showConfirmPassword ? <EyeOff aria-hidden="true" className="size-4.5" /> : <Eye aria-hidden="true" className="size-4.5" />}
            </button>
          </div>
          <FieldError id="reset-confirm-password-error">{fieldErrors.confirmPassword}</FieldError>
        </Field>

        <Button type="submit" size="lg" disabled={submitting} className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white shadow-[0_10px_20px_rgba(124,63,29,0.2)] hover:bg-[#663115] dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300">
          {submitting ? <><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Resetting password…</> : "Reset password"}
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
