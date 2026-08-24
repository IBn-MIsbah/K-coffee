"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeEmail, changePassword } from "@/lib/auth-client";
import { emailChangeSchema, passwordChangeSchema } from "@/lib/account/security-validation";
import { ChevronRight, KeyRound, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Editor = "profile" | "password" | "email" | null;
type Store = { id: string; name: string; address: string };

export default function AccountSettings({ name, phone, email, stores, defaultStoreId }: { name: string; phone: string; email: string; stores: Store[]; defaultStoreId: string | null }) {
  const [editor, setEditor] = useState<Editor>(null);
  const [profile, setProfile] = useState({ name, phone, defaultStoreId: defaultStoreId ?? "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function openEditor(next: Exclude<Editor, null>) { setError(""); setEditor(next); }
  async function saveProfile() {
    setBusy(true); setError("");
    try { const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(stores.length ? profile : { name: profile.name, phone: profile.phone }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Unable to save your details."); toast.success("Personal details saved."); setEditor(null); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save your details."); } finally { setBusy(false); }
  }
  async function savePassword() {
    const parsed = passwordChangeSchema.safeParse(password); if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your password details."); return; }
    setBusy(true); setError(""); const result = await changePassword({ currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword, revokeOtherSessions: true }); setBusy(false);
    if (result.error) { setError(result.error.message ?? "Unable to update your password."); return; }
    setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" }); toast.success("Password updated. Other sessions were signed out."); setEditor(null);
  }
  async function requestEmailChange() {
    const parsed = emailChangeSchema.safeParse({ newEmail }); if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your email address."); return; }
    setBusy(true); setError(""); const result = await changeEmail({ newEmail: parsed.data.newEmail, callbackURL: "/dashboard/profile" }); setBusy(false);
    if (result.error) { setError(result.error.message ?? "Unable to request this change."); return; }
    setNewEmail(""); toast.success("Check your email to continue the change."); setEditor(null);
  }

  return <section className="mt-7"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a56328]">Account controls</p><h2 className="mt-1 text-2xl font-extrabold tracking-[-.03em] text-[#2c1911]">Manage your details</h2></div><p className="hidden max-w-xs text-right text-sm leading-5 text-[#725b4c] sm:block">Select a section to make a focused, secure update.</p></div><div className="grid gap-4 lg:grid-cols-3"><SettingsCard icon={UserRound} title="Personal details" description="Name, phone, and default pickup location." value={profile.name || "Add your details"} action="Edit details" onClick={() => openEditor("profile")} /><SettingsCard icon={KeyRound} title="Password" description="Update it and sign out other devices." value="Last changed securely" action="Change password" onClick={() => openEditor("password")} /><SettingsCard icon={Mail} title="Sign-in email" description="Verify any address change before it takes effect." value={email || "No email address"} action="Change email" onClick={() => openEditor("email")} /></div>
    <Dialog open={editor === "profile"} onOpenChange={(open) => !open && setEditor(null)}><DialogContent><DialogHeader><DialogTitle>Edit personal details</DialogTitle><DialogDescription>Update the information used for pickup and account contact.</DialogDescription></DialogHeader><form action={saveProfile} className="space-y-5"><Field label="Name"><Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} className="min-h-11 rounded-xl border-[#dfc6a9] bg-white" /></Field><Field label="Phone"><Input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} className="min-h-11 rounded-xl border-[#dfc6a9] bg-white" /></Field>{stores.length > 0 && <Field label="Default pickup location"><select value={profile.defaultStoreId} onChange={(event) => setProfile({ ...profile, defaultStoreId: event.target.value })} className="min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-white px-3 text-sm text-[#3b2116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#934817]"><option value="">Choose at checkout</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.name} — {store.address}</option>)}</select></Field>}{error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}<DialogFooter><DialogClose asChild><Button type="button" variant="ghost" className="min-h-11">Cancel</Button></DialogClose><Button disabled={busy} className="min-h-11 bg-[#b56527] hover:bg-[#934817]">{busy ? "Saving…" : "Save details"}</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={editor === "password"} onOpenChange={(open) => !open && setEditor(null)}><DialogContent><DialogHeader><DialogTitle>Change password</DialogTitle><DialogDescription>For your security, your other signed-in devices will be signed out.</DialogDescription></DialogHeader><form action={savePassword} className="space-y-5"><Field label="Current password"><Input type="password" autoComplete="current-password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} className="min-h-11 rounded-xl border-[#dfc6a9] bg-white" /></Field><Field label="New password"><Input type="password" autoComplete="new-password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} className="min-h-11 rounded-xl border-[#dfc6a9] bg-white" /></Field><Field label="Confirm new password"><Input type="password" autoComplete="new-password" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} className="min-h-11 rounded-xl border-[#dfc6a9] bg-white" /></Field>{error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}<DialogFooter><DialogClose asChild><Button type="button" variant="ghost" className="min-h-11">Cancel</Button></DialogClose><Button disabled={busy} className="min-h-11 bg-[#3b2116] hover:bg-[#24130c]">{busy ? "Updating…" : "Update password"}</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={editor === "email"} onOpenChange={(open) => !open && setEditor(null)}><DialogContent><DialogHeader><DialogTitle>Change sign-in email</DialogTitle><DialogDescription>We&apos;ll use email verification to protect this request. Your current sign-in email remains active until the change is confirmed.</DialogDescription></DialogHeader><form action={requestEmailChange} className="space-y-5"><Field label="New email address"><Input type="email" autoComplete="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className="min-h-11 rounded-xl border-[#dfc6a9] bg-white" /></Field>{error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}<DialogFooter><DialogClose asChild><Button type="button" variant="ghost" className="min-h-11">Cancel</Button></DialogClose><Button disabled={busy} className="min-h-11 bg-[#b56527] hover:bg-[#934817]">{busy ? "Sending…" : "Request change"}</Button></DialogFooter></form></DialogContent></Dialog>
  </section>;
}

function SettingsCard({ icon: Icon, title, description, value, action, onClick }: { icon: typeof UserRound; title: string; description: string; value: string; action: string; onClick: () => void }) { return <section className="group rounded-[1.6rem] border border-white/70 bg-white/55 p-5 shadow-[0_14px_36px_rgba(88,49,22,.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/75"><span className="grid size-11 place-items-center rounded-2xl bg-[#f5dfba] text-[#7d4018]"><Icon aria-hidden="true" className="size-5" /></span><h3 className="mt-5 font-extrabold text-[#2c1911]">{title}</h3><p className="mt-1 min-h-10 text-sm leading-5 text-[#725b4c]">{description}</p><p className="mt-4 truncate text-sm font-semibold text-[#583725]">{value}</p><Button type="button" variant="ghost" onClick={onClick} className="mt-4 min-h-11 w-full justify-between rounded-xl bg-white/60 text-[#7d4018] hover:bg-[#f5dfba] hover:text-[#56301b]">{action}<ChevronRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" /></Button></section> }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}</div> }
