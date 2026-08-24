"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,128}$/, "This invitation link is invalid.");
type Invitation = { email: string; role: "CASHIER" | "ADMIN"; expiresAt: string };

export default function StaffInvitationAcceptance() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const token = searchParams.get("token") ?? "";
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const signInHref = useMemo(() => `/login?callbackUrl=${encodeURIComponent(`/staff/accept?token=${token}`)}`, [token]);

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
      const response = await fetch("/api/staff/invitations/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
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

  return <section className="rounded-2xl bg-white p-8 shadow-xl">
    <p className="text-sm font-semibold text-amber-700">K-Coffee staff access</p>
    <h1 className="mt-2 text-3xl font-bold text-gray-900">Accept your invitation</h1>
    {isLoading && <p className="mt-4 text-gray-600">Checking your invitation…</p>}
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
    {invitation && <div className="mt-5 space-y-5"><p className="text-gray-600">You were invited as a <strong className="text-gray-900">{invitation.role === "CASHIER" ? "Cashier" : "Administrator"}</strong> using <strong className="break-all text-gray-900">{invitation.email}</strong>.</p>{session?.user ? <><p className="text-sm text-gray-600">Signed in as {session.user.email}. You must be signed in with the invited email address.</p><Button type="button" onClick={acceptInvitation} disabled={isAccepting} className="min-h-11 w-full bg-amber-600 hover:bg-amber-700">{isAccepting ? "Activating access…" : "Accept staff access"}</Button></> : <div className="space-y-3"><p className="text-sm text-gray-600">Sign in with the invited email address to accept this access.</p><Button asChild className="min-h-11 w-full bg-amber-600 hover:bg-amber-700"><Link href={signInHref}>Sign in to continue</Link></Button><p className="text-center text-sm text-gray-600">Need an account? <Link href="/register" className="font-semibold text-amber-800 underline underline-offset-4">Create and verify one</Link>, then open this invitation link again.</p></div>}</div>}
  </section>;
}
