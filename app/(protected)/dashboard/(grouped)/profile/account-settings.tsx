"use client";
import { Button } from "@/components/ui/button";
import { changePassword } from "@/lib/auth-client";
import { useState } from "react";
export default function AccountSettings({
  name,
  phone,
}: {
  name: string;
  phone: string;
}) {
  const [profile, setProfile] = useState({ name, phone });
  const [password, setPassword] = useState({ current: "", next: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function saveProfile() {
    setBusy(true);
    setMessage("");
    const r = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setMessage(r.ok ? "Profile saved." : (await r.json()).error);
    setBusy(false);
  }
  async function savePassword() {
    setBusy(true);
    setMessage("");
    const result = await changePassword({
      currentPassword: password.current,
      newPassword: password.next,
      revokeOtherSessions: true,
    });
    setMessage(
      result.error?.message ??
        "Password updated. Other sessions were signed out.",
    );
    setBusy(false);
  }
  return (
    <div className="mt-7 grid gap-6 lg:grid-cols-2">
      <form
        action={saveProfile}
        className="rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-6"
      >
        <h2 className="text-lg font-bold text-[#3b2116]">Personal details</h2>
        <label className="mt-5 block text-sm font-semibold">
          Name
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="mt-2 min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-white px-3"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Phone
          <input
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="mt-2 min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-white px-3"
          />
        </label>
        <Button
          disabled={busy}
          className="mt-5 min-h-11 w-full bg-[#b56527] hover:bg-[#934817]"
        >
          Save details
        </Button>
      </form>
      <form
        action={savePassword}
        className="rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-6"
      >
        <h2 className="text-lg font-bold text-[#3b2116]">Password</h2>
        <label className="mt-5 block text-sm font-semibold">
          Current password
          <input
            type="password"
            autoComplete="current-password"
            value={password.current}
            onChange={(e) =>
              setPassword({ ...password, current: e.target.value })
            }
            className="mt-2 min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-white px-3"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          New password
          <input
            type="password"
            autoComplete="new-password"
            value={password.next}
            onChange={(e) => setPassword({ ...password, next: e.target.value })}
            className="mt-2 min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-white px-3"
          />
        </label>
        <Button
          disabled={busy || password.next.length < 8}
          className="mt-5 min-h-11 w-full bg-[#3b2116] hover:bg-[#24130c]"
        >
          Update password
        </Button>
      </form>
      {message && (
        <p role="status" className="lg:col-span-2 text-sm text-[#725b4c]">
          {message}
        </p>
      )}
    </div>
  );
}
