"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, LoaderCircle, LogOut, ShieldCheck, UserRoundPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import AuthPageHeader from "@/components/auth/AuthPageHeader";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,128}$/, "This invitation link is invalid.");
type Invitation = { email: string; role: "CASHIER" | "ADMIN"; expiresAt: string };

function formatInvitationExpiry(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "the date shown in your email";

  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Addis_Ababa",
  }).format(date);
}

export default function StaffInvitationAcceptance() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const token = searchParams.get("token") ?? "";
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const signInHref = useMemo(
    () => `/login?callbackUrl=${encodeURIComponent(`/staff/accept?token=${token}`)}`,
    [token],
  );
  const registerHref = useMemo(
    () => `/register?callbackUrl=${encodeURIComponent(`/staff/accept?token=${token}`)}`,
    [token],
  );

  useEffect(() => {
    const parsed = tokenSchema.safeParse(token);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "This invitation link is invalid.");
      setIsLoading(false);
      return;
    }

    fetch(`/api/staff/invitations/accept?token=${encodeURIComponent(parsed.data)}`)
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (!response.ok) setError(data.error ?? "This invitation is no longer available.");
        else setInvitation(data);
      })
      .catch(() => setError("Unable to check this invitation. Please try again."))
      .finally(() => setIsLoading(false));
  }, [token]);

  async function acceptInvitation() {
    setIsAccepting(true);
    setError("");

    try {
      const response = await fetch("/api/staff/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) {
        const message = data.error ?? "Unable to accept this invitation.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Staff access is now active.");
      router.replace("/dashboard");
      router.refresh();
    } catch {
      const message = "Unable to accept this invitation. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsAccepting(false);
    }
  }

  async function switchAccount() {
    setIsSwitchingAccount(true);
    setError("");
    try {
      const result = await signOut();
      if (result.error) {
        const message = "We could not sign you out. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }
      router.replace(signInHref);
      router.refresh();
    } catch {
      const message = "We could not sign you out. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSwitchingAccount(false);
    }
  }

  const signedInEmail = session?.user?.email?.trim().toLowerCase();
  const invitedEmail = invitation?.email.trim().toLowerCase();
  const isSignedInWithInvitedEmail = Boolean(signedInEmail && invitedEmail && signedInEmail === invitedEmail);
  const roleLabel = invitation?.role === "CASHIER" ? "Cashier" : "Administrator";

  return (
    <div className="space-y-8">
      <AuthPageHeader eyebrow="K-Coffee staff access" title="Accept your invitation" description="Review the invitation, then sign in with the email address it was sent to." />

      {isLoading ? <p role="status" className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">Checking your invitation…</p> : null}
      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">{error}</p> : null}

      {invitation ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/70 dark:bg-amber-950/30">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200"><ShieldCheck aria-hidden="true" className="size-5" /></span>
              <div className="min-w-0 space-y-2 text-sm leading-6 text-amber-950 dark:text-amber-100">
                <p>You were invited to join K-Coffee as a <strong>{roleLabel}</strong>.</p>
                <p className="break-all text-amber-900/80 dark:text-amber-100/80">{invitation.email}</p>
                <p className="flex items-start gap-2 text-xs text-amber-900/70 dark:text-amber-100/70"><CalendarClock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /> Expires {formatInvitationExpiry(invitation.expiresAt)} (Ethiopia time).</p>
              </div>
            </div>
          </div>

          {!session?.user ? (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">Sign in with the invited email address to activate this staff access.</p>
              <Button asChild className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white hover:bg-[#663115] dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300">
                <Link href={signInHref}>Sign in to continue</Link>
              </Button>
              <p className="text-center text-sm leading-6 text-stone-600 dark:text-stone-300">Do not have an account yet? <Link href={registerHref} className="font-semibold text-amber-800 underline decoration-amber-800/35 underline-offset-4 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100">Create and verify one</Link>.</p>
            </div>
          ) : isSignedInWithInvitedEmail ? (
            <div className="space-y-4">
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100">Signed in as <strong className="break-all">{session.user.email}</strong>. You can accept this invitation now.</p>
              <Button type="button" onClick={acceptInvitation} disabled={isAccepting} className="h-12 w-full rounded-xl bg-[#7c3f1d] text-base font-semibold text-white hover:bg-[#663115] dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300">
                {isAccepting ? <><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Activating staff access…</> : "Accept staff access"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">You are signed in as <strong className="break-all">{session.user.email}</strong>. This invitation was sent to <strong className="break-all">{invitation.email}</strong>, so please switch accounts before accepting it.</p>
              <Button type="button" onClick={switchAccount} disabled={isSwitchingAccount} variant="outline" className="h-12 w-full rounded-xl border-amber-300 bg-transparent text-amber-950 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/60">
                {isSwitchingAccount ? <><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Signing out…</> : <><LogOut aria-hidden="true" className="size-4" /> Sign out and switch account</>}
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {!isLoading && !invitation ? (
        <Button asChild variant="ghost" className="h-11 w-full rounded-xl text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
          <Link href="/contact"><UserRoundPlus aria-hidden="true" className="size-4" /> Contact K-Coffee support</Link>
        </Button>
      ) : null}
    </div>
  );
}
