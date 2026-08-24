"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import AuthPageHeader from "@/components/auth/AuthPageHeader";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { firstFieldErrors, registrationSchema, type FieldErrors } from "@/lib/auth-form-validation";

export default function RegisterForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const loginHref = `/login?callbackUrl=${encodeURIComponent(returnTo)}`;

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

  function showServiceError(message: string) {
    setFormError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
    toast.error(message);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const parsed = registrationSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const errors = firstFieldErrors(parsed.error);
      setFieldErrors(errors);
      const firstField = Object.keys(errors)[0];
      if (firstField) focusField(firstField);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const verificationUrl = new URL("/verify-email", window.location.origin);
      verificationUrl.searchParams.set("returnTo", returnTo);

      const result = await signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: verificationUrl.toString(),
      });

      if (result.error) {
        showServiceError(result.error.message || "We could not create your account. Please review your details and try again.");
        return;
      }

      toast.success("Your account is ready.", { description: "Check your inbox to verify your email address." });
      router.push(`/verify-email?returnTo=${encodeURIComponent(returnTo)}`);
      router.refresh();
    } catch {
      showServiceError("We could not create your account right now. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <AuthPageHeader title="Create your account" description="Save your details, order ahead for pickup, and keep your coffee routine close." />

      <form ref={formRef} noValidate onSubmit={handleSubmit} className="space-y-5">
        {formError ? (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 outline-none dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200"
          >
            {formError}
          </div>
        ) : null}

        <Field data-invalid={Boolean(fieldErrors.name)}>
          <FieldLabel htmlFor="name">Your name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="How should we address you?"
            required
            maxLength={80}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
            onChange={() => clearFieldError("name")}
            className="h-12 rounded-xl border-stone-300 bg-white/80 px-4 text-base shadow-none placeholder:text-stone-400 focus-visible:border-amber-700 focus-visible:ring-amber-700/25 dark:border-stone-700 dark:bg-stone-950/40 dark:placeholder:text-stone-500"
          />
          <FieldError id="register-name-error">{fieldErrors.name}</FieldError>
        </Field>

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
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
            onChange={() => clearFieldError("email")}
            className="h-12 rounded-xl border-stone-300 bg-white/80 px-4 text-base shadow-none placeholder:text-stone-400 focus-visible:border-amber-700 focus-visible:ring-amber-700/25 dark:border-stone-700 dark:bg-stone-950/40 dark:placeholder:text-stone-500"
          />
          <FieldError id="register-email-error">{fieldErrors.email}</FieldError>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.password)}>
          <FieldLabel htmlFor="password">Create a password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "register-password-error" : "register-password-help"}
              onChange={() => clearFieldError("password")}
              className="h-12 rounded-xl border-stone-300 bg-white/80 px-4 pr-12 text-base shadow-none focus-visible:border-amber-700 focus-visible:ring-amber-700/25 dark:border-stone-700 dark:bg-stone-950/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-0 top-0 grid size-12 place-items-center rounded-r-xl text-stone-500 transition-colors hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-amber-700 dark:text-stone-400 dark:hover:bg-amber-950/60 dark:hover:text-amber-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff aria-hidden="true" className="size-4.5" /> : <Eye aria-hidden="true" className="size-4.5" />}
            </button>
          </div>
          <FieldDescription id="register-password-help">Use at least 8 characters. Password managers and paste are supported.</FieldDescription>
          <FieldError id="register-password-error">{fieldErrors.password}</FieldError>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.confirmPassword)}>
          <FieldLabel htmlFor="confirmPassword">Confirm your password</FieldLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? "register-confirm-password-error" : undefined}
              onChange={() => clearFieldError("confirmPassword")}
              className="h-12 rounded-xl border-stone-300 bg-white/80 px-4 pr-12 text-base shadow-none focus-visible:border-amber-700 focus-visible:ring-amber-700/25 dark:border-stone-700 dark:bg-stone-950/40"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              className="absolute right-0 top-0 grid size-12 place-items-center rounded-r-xl text-stone-500 transition-colors hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-amber-700 dark:text-stone-400 dark:hover:bg-amber-950/60 dark:hover:text-amber-200"
              aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
            >
              {showConfirmPassword ? <EyeOff aria-hidden="true" className="size-4.5" /> : <Eye aria-hidden="true" className="size-4.5" />}
            </button>
          </div>
          <FieldError id="register-confirm-password-error">{fieldErrors.confirmPassword}</FieldError>
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white shadow-[0_10px_20px_rgba(124,63,29,0.2)] transition-transform hover:scale-[1.01] hover:bg-[#663115] focus-visible:ring-[#7c3f1d]/30 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
        >
          {isSubmitting ? <><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Creating your account…</> : "Create account"}
        </Button>
      </form>

      <div className="space-y-3 border-t border-stone-200 pt-6 text-center text-sm leading-6 text-stone-600 dark:border-stone-800 dark:text-stone-300">
        <p>
          By creating an account, you agree to the development-stage{" "}
          <Link href="/terms" className="font-semibold text-amber-800 underline decoration-amber-800/35 underline-offset-4 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-amber-800 underline decoration-amber-800/35 underline-offset-4 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100">Privacy Policy</Link>.
        </p>
        <p>
          Already have an account?{" "}
          <Link href={loginHref} className="font-semibold text-amber-800 underline decoration-amber-800/35 underline-offset-4 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
