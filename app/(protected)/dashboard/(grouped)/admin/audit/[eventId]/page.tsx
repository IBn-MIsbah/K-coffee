import Link from "next/link";
import { notFound } from "next/navigation";

import { UserRole } from "@/lib/rbac";
import { toSafeAuditDetails } from "@/lib/audit-details";
import { getAuditEvent } from "@/lib/audit-service";
import { requirePageRole } from "@/lib/authz";

export default async function AuditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  await requirePageRole([UserRole.SUPERADMIN], "/dashboard/admin/audit");
  const { eventId } = await params;
  const event = await getAuditEvent(eventId);
  if (!event) notFound();
  const details = toSafeAuditDetails(event.details);

  return <section className="mx-auto max-w-3xl space-y-6">
    <header><Link href="/dashboard/admin/audit" className="text-sm font-semibold text-amber-800 underline underline-offset-4 hover:text-amber-950">Back to audit log</Link><p className="mt-5 text-sm font-semibold text-amber-700">Read-only event</p><h1 className="mt-1 text-3xl font-bold text-amber-950">{event.action} · {event.resource}</h1><p className="mt-2 text-slate-600">Event ID: <span className="break-all font-mono text-sm">{event.id}</span></p></header>
    <dl className="grid overflow-hidden rounded-3xl border border-[#ead9bf] bg-white shadow-sm sm:grid-cols-2"> <Detail label="Recorded" value={new Intl.DateTimeFormat("en-ET", { timeZone: "Africa/Addis_Ababa", dateStyle: "full", timeStyle: "medium" }).format(event.createdAt)} /><Detail label="Actor" value={event.user?.name ?? event.user?.email ?? "System"} /><Detail label="Actor role" value={event.userRole} /><Detail label="Resource ID" value={event.resourceId ?? "Not applicable"} /></dl>
    <section className="rounded-3xl border border-[#ead9bf] bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-amber-950">Safe event details</h2><p className="mt-1 text-sm text-slate-600">Potential secrets, credentials, session data, payment data, and oversized values are redacted or omitted.</p>{details.length ? <dl className="mt-5 divide-y divide-[#ead9bf]">{details.map((detail) => <Detail key={detail.label} label={detail.label} value={detail.value} compact />)}</dl> : <p className="mt-5 rounded-xl bg-[#fffaf0] p-4 text-sm text-[#725b4c]">This event has no approved display details.</p>}</section>
  </section>;
}

function Detail({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) { return <div className={compact ? "grid gap-1 py-3 sm:grid-cols-[10rem_1fr]" : "border-[#ead9bf] p-5 even:bg-[#fffaf0]"}><dt className="text-xs font-semibold uppercase tracking-wide text-[#725b4c]">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-[#3b2116]">{value}</dd></div>; }
