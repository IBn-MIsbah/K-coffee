"use client";

import { Button } from "@/components/ui/button";
import { listSessions, revokeOtherSessions, revokeSession, useSession } from "@/lib/auth-client";
import { Laptop, LoaderCircle, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SessionRecord = {
  id: string;
  token: string;
  createdAt: Date | string;
  expiresAt: Date | string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export default function SessionManager() {
  const { data: currentSession } = useSession();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function refreshSessions() {
    setLoading(true);
    const result = await listSessions();
    if (result.error) toast.error(result.error.message ?? "Unable to load your sessions.");
    else setSessions((result.data ?? []) as SessionRecord[]);
    setLoading(false);
  }

  useEffect(() => {
    void listSessions().then((result) => {
      if (result.error) toast.error(result.error.message ?? "Unable to load your sessions.");
      else setSessions((result.data ?? []) as SessionRecord[]);
      setLoading(false);
    });
  }, []);

  async function removeSession(token: string) {
    setBusy(token);
    const result = await revokeSession({ token });
    if (result.error) toast.error(result.error.message ?? "Unable to sign out this session.");
    else {
      toast.success("Session signed out.");
      await refreshSessions();
    }
    setBusy(null);
  }

  async function removeOtherSessions() {
    setBusy("others");
    const result = await revokeOtherSessions();
    if (result.error) toast.error(result.error.message ?? "Unable to sign out other sessions.");
    else {
      toast.success("Other sessions were signed out.");
      await refreshSessions();
    }
    setBusy(null);
  }

  const currentToken = currentSession?.session.token;

  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/55 p-6 shadow-[0_16px_42px_rgba(88,49,22,.1)] backdrop-blur-xl sm:p-7 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#3b2116]">Signed-in devices</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#725b4c]">Review active sessions and sign out devices you no longer use. Sensitive actions may require a recently signed-in session.</p>
        </div>
        <Button type="button" variant="outline" disabled={busy !== null} onClick={removeOtherSessions} className="min-h-11 rounded-xl border-[#c9853c] text-[#6d3514] hover:bg-[#f7ebd8] hover:text-[#3b2116]">
          {busy === "others" && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          Sign out other devices
        </Button>
      </div>

      {loading ? <p className="mt-5 flex items-center gap-2 text-sm text-[#725b4c]"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />Loading sessions…</p> : sessions.length ? <ul className="mt-5 divide-y divide-[#ead9bf] rounded-2xl border border-[#ead9bf] bg-white">{sessions.map((session) => {
        const current = session.token === currentToken;
        return <li key={session.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f5dfba] text-[#7d4018]"><Laptop aria-hidden="true" className="size-5" /></span><div className="min-w-0"><p className="font-semibold text-[#3b2116]">{current ? "This device" : session.userAgent || "Unknown device"}</p><p className="mt-1 text-xs leading-5 text-[#725b4c]">Active since {new Intl.DateTimeFormat("en-ET", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Addis_Ababa" }).format(new Date(session.createdAt))}</p></div></div>{current ? <span className="inline-flex items-center gap-1 text-sm font-bold text-[#50713a]"><ShieldCheck aria-hidden="true" className="size-4" />Current</span> : <Button type="button" variant="ghost" disabled={busy !== null} onClick={() => removeSession(session.token)} className="min-h-11 text-[#8b3224] hover:bg-red-50 hover:text-[#8b3224]">{busy === session.token ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Trash2 aria-hidden="true" className="size-4" />}Sign out</Button>}</li>;
      })}</ul> : <p className="mt-5 rounded-2xl border border-dashed border-[#dfc6a9] bg-white p-4 text-sm text-[#725b4c]">No active sessions are available to display.</p>}
    </section>
  );
}
