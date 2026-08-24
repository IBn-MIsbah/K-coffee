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
import { signIn } from "@/lib/auth-client";
import { firstFieldErrors, loginSchema, type FieldErrors } from "@/lib/auth-form-validation";

function continuationDescription(returnTo: string) {
  if (returnTo === "/cart" || returnTo.startsWith("/cart/")) {
    return "Sign in to keep your selected items and continue to your cart.";
  }

  if (returnTo === "/checkout" || returnTo.startsWith("/checkout/")) {
    return "Sign in to continue securely to pickup checkout.";
  }

  if (returnTo.startsWith("/staff/accept")) {
    return "Sign in with the email address that received the staff invitation.";
  }

  return "Sign in to manage orders, favourites, and your K-Coffee account.";
}

export default function LoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const registerHref = `/register?callbackUrl=${encodeURIComponent(returnTo)}`;
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

  function showServiceError(message: string) {
    setFormError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
    toast.error(message);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
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
      const result = await signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: returnTo,
      });

      if (result.error) {
        showServiceError(result.error.message || "We could not sign you in. Check your email and password, then try again.");
        return;
      }

      toast.success("You are signed in.", { description: "Taking you to your account now." });
      router.push(returnTo);
      router.refresh();
    } catch {
      showServiceError("We could not sign you in right now. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <AuthPageHeader title="Welcome back" description={continuationDescription(returnTo)} />

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
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            onChange={() => clearFieldError("email")}
            className="h-12 rounded-xl border-stone-300 bg-white/80 px-4 text-base shadow-none placeholder:text-stone-400 focus-visible:border-amber-700 focus-visible:ring-amber-700/25 dark:border-stone-700 dark:bg-stone-950/40 dark:placeholder:text-stone-500"
          />
          <FieldError id="login-email-error">{fieldErrors.email}</FieldError>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
              onChange={() => clearFieldError("password")}
              className="h-12 rounded-xl border-stone-300 bg-white/80 px-4 pr-12 text-base shadow-none placeholder:text-stone-400 focus-visible:border-amber-700 focus-visible:ring-amber-700/25 dark:border-stone-700 dark:bg-stone-950/40"
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
          <FieldError id="login-password-error">{fieldErrors.password}</FieldError>
          <div className="flex justify-end">
            <Link
              href={forgotPasswordHref}
              className="rounded-sm text-sm font-semibold text-amber-800 underline decoration-amber-800/35 underline-offset-4 transition-colors hover:text-amber-950 hover:decoration-amber-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700 dark:text-amber-300 dark:hover:text-amber-100"
            >
              Forgot password?
            </Link>
          </div>
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white shadow-[0_10px_20px_rgba(124,63,29,0.2)] transition-transform hover:scale-[1.01] hover:bg-[#663115] focus-visible:ring-[#7c3f1d]/30 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
        >
          {isSubmitting ? <><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Signing in…</> : "Sign in"}
        </Button>
      </form>

      <div className="space-y-3 border-t border-stone-200 pt-6 text-center text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300">
        <p>
          New to K-Coffee?{" "}
          <Link href={registerHref} className="font-semibold text-amber-800 underline decoration-amber-800/35 underline-offset-4 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100">
            Create an account
          </Link>
        </p>
        <FieldDescription className="text-xs">Your account lets you order for pickup and keep your order history together.</FieldDescription>
      </div>
    </div>
  );
}
