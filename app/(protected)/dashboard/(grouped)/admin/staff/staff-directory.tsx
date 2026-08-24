"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const roles = ["SUPERADMIN", "ADMIN", "CASHIER", "USER"];
const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid staff email address.").max(320),
  role: z.enum(["CASHIER", "ADMIN"]),
});

type StaffUser = { id: string; name: string; role: string; stores: string[] };

export default function StaffDirectory({ users }: { users: StaffUser[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState("");
  const [inviteError, setInviteError] = useState("");

  async function update(id: string, role: string) {
    setBusy(id);
    setError("");

    try {
      const response = await fetch(`/api/admin/staff/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data.error ?? "Role update failed.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Staff role updated");
      router.refresh();
    } catch {
      const message = "Unable to update the staff role. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  }

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const parsed = inviteSchema.safeParse(Object.fromEntries(new FormData(formElement)));
    setInviteError("");

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Check the invitation details and try again.";
      setInviteError(message);
      return;
    }

    setIsInviting(true);
    try {
      const response = await fetch("/api/admin/staff/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data.error ?? "Invitation could not be sent.";
        setInviteError(message);
        toast.error(message);
        return;
      }

      formElement.reset();
      toast.success("Staff invitation sent");
      router.refresh();
    } catch {
      const message = "Unable to send the invitation. Please try again.";
      setInviteError(message);
      toast.error(message);
    } finally {
      setIsInviting(false);
    }
  }

  return <section className="mx-auto max-w-6xl">
    <p className="text-sm font-semibold text-amber-700">Superadmin only</p>
    <h1 className="mt-1 text-3xl font-bold text-amber-950">Staff access</h1>
    <p className="mt-2 text-slate-600">Cashiers require a store assignment before they can process orders.</p>

    <form onSubmit={invite} className="mt-6 grid gap-3 rounded-2xl border bg-white p-5 sm:grid-cols-3">
      <label className="grid gap-1 text-sm font-semibold">Staff email<input required name="email" type="email" autoComplete="email" className="min-h-11 rounded-lg border px-3" /></label>
      <label className="grid gap-1 text-sm font-semibold">Role<select name="role" defaultValue="CASHIER" className="min-h-11 rounded-lg border px-3"><option value="CASHIER">Cashier</option><option value="ADMIN">Admin</option></select></label>
      <button type="submit" disabled={isInviting} className="min-h-11 self-end rounded-lg bg-amber-700 px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{isInviting ? "Sending invitation…" : "Send invitation"}</button>
      {inviteError && <p role="alert" className="text-sm text-red-700 sm:col-span-3">{inviteError}</p>}
    </form>

    {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
    <div className="mt-6 divide-y rounded-2xl border bg-white">
      {users.map((user) => <article key={user.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><h2 className="font-semibold text-amber-950">{user.name}</h2><p className="text-sm text-slate-600">Stores: {user.stores.join(", ") || "No store assignment"}</p></div><label className="sr-only" htmlFor={`role-${user.id}`}>Role for {user.name}</label><select id={`role-${user.id}`} defaultValue={user.role} disabled={busy === user.id} onChange={(event) => update(user.id, event.target.value)} className="min-h-11 rounded-lg border px-3"><option value={user.role}>{user.role}</option>{roles.filter((role) => role !== user.role).map((role) => <option key={role}>{role}</option>)}</select></article>)}
    </div>
  </section>;
}
