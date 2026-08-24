import Link from "next/link";

import { UserRole as PrismaUserRole } from "@/app/generated/prisma/client";
import { AuditFilterError, parseAuditFilters } from "@/lib/audit-validation";
import { listAuditEvents } from "@/lib/audit-service";
import { requirePageRole } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requirePageRole([UserRole.SUPERADMIN], "/dashboard/admin/audit");
  let error = "";
  let filters;
  try { filters = parseAuditFilters(await searchParams); }
  catch (cause) { error = cause instanceof AuditFilterError ? cause.message : "The audit filters are invalid."; filters = parseAuditFilters({}); }

  const { events, hasNextPage } = await listAuditEvents(filters);
  const pageUrl = (page: number) => {
    const next = new URLSearchParams();
    if (filters.actor) next.set("actor", filters.actor); if (filters.role) next.set("role", filters.role);
    if (filters.resource) next.set("resource", filters.resource); if (filters.action) next.set("action", filters.action);
    if (filters.from) next.set("from", filters.from); if (filters.to) next.set("to", filters.to);
    next.set("page", String(page));
    return `/dashboard/admin/audit?${next.toString()}`;
  };

  return <section className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-sm font-semibold text-amber-700">Superadmin only</p><h1 className="mt-1 text-3xl font-bold text-amber-950">Audit log</h1><p className="mt-2 max-w-2xl text-slate-600">Review operational activity using Ethiopia-local dates. Sensitive session, payment, and request data is never displayed here.</p></header>
    <form className="grid gap-4 rounded-3xl border border-[#ead9bf] bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-3" action="/dashboard/admin/audit">
      <input type="hidden" name="page" value="1" />
      <Field label="Actor name or email" htmlFor="actor"><input id="actor" name="actor" defaultValue={filters.actor} className={fieldClass} placeholder="Contains" /></Field>
      <Field label="Role" htmlFor="role"><select id="role" name="role" defaultValue={filters.role ?? ""} className={fieldClass}><option value="">All roles</option>{Object.values(PrismaUserRole).map((role) => <option key={role} value={role}>{role}</option>)}</select></Field>
      <Field label="Resource" htmlFor="resource"><input id="resource" name="resource" defaultValue={filters.resource} className={fieldClass} placeholder="Exact resource" /></Field>
      <Field label="Action" htmlFor="action"><input id="action" name="action" defaultValue={filters.action} className={fieldClass} placeholder="Exact action" /></Field>
      <Field label="From date (Ethiopia)" htmlFor="from"><input id="from" name="from" type="date" defaultValue={filters.from} className={fieldClass} /></Field>
      <Field label="To date (Ethiopia)" htmlFor="to"><input id="to" name="to" type="date" defaultValue={filters.to} className={fieldClass} /></Field>
      <div className="flex items-end gap-3"><button type="submit" className="min-h-11 rounded-xl bg-amber-700 px-5 font-bold text-white hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800">Apply filters</button><Link href="/dashboard/admin/audit" className="inline-flex min-h-11 items-center rounded-xl px-4 font-semibold text-amber-800 underline hover:bg-amber-50">Clear</Link></div>
      <p className="text-sm text-slate-600 lg:col-span-3">Actor search matches name or email. Resource and action use exact matches. Date ranges are limited to 93 days.</p>
      {error && <p role="alert" className="text-sm font-medium text-red-700 lg:col-span-3">{error}</p>}
    </form>
    <section className="overflow-hidden rounded-3xl border border-[#ead9bf] bg-white shadow-sm">
      <div className="border-b border-[#ead9bf] px-5 py-4"><h2 className="text-lg font-bold text-amber-950">Matching events</h2></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#fffaf0] text-xs uppercase tracking-wide text-[#725b4c]"><tr><th className="px-5 py-3">When</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Resource</th><th className="px-5 py-3">Role</th></tr></thead><tbody className="divide-y divide-[#ead9bf]">{events.map((event) => <tr key={event.id}><td className="whitespace-nowrap px-5 py-4 text-[#3b2116]">{new Intl.DateTimeFormat("en-ET", { timeZone: "Africa/Addis_Ababa", dateStyle: "medium", timeStyle: "short" }).format(event.createdAt)}</td><td className="max-w-56 px-5 py-4 text-[#3b2116]"><span className="block break-words font-medium">{event.user?.name ?? event.user?.email ?? "System"}</span>{event.user?.name && event.user.email && <span className="mt-1 block break-words text-xs text-[#725b4c]">{event.user.email}</span>}</td><td className="px-5 py-4 font-medium text-[#3b2116]"><Link href={`/dashboard/admin/audit/${event.id}`} className="rounded underline decoration-amber-400 underline-offset-4 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800">{event.action}</Link></td><td className="max-w-64 px-5 py-4 text-[#3b2116]"><span className="break-words">{event.resource}</span>{event.resourceId && <span className="mt-1 block break-all font-mono text-xs text-[#725b4c]">{event.resourceId}</span>}</td><td className="px-5 py-4 font-semibold text-[#3b2116]">{event.userRole}</td></tr>)}{!events.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-600">No audit events match these filters.</td></tr>}</tbody></table></div>
      <nav aria-label="Audit result pages" className="flex items-center justify-between gap-4 border-t border-[#ead9bf] px-5 py-4"><p className="text-sm text-slate-600">Page {filters.page}</p><div className="flex gap-2">{filters.page > 1 && <Link href={pageUrl(filters.page - 1)} className="inline-flex min-h-11 items-center rounded-xl border border-[#d8bc9a] px-4 font-semibold text-[#3b2116] hover:bg-[#fffaf0]">Previous</Link>}{hasNextPage && <Link href={pageUrl(filters.page + 1)} className="inline-flex min-h-11 items-center rounded-xl border border-[#d8bc9a] px-4 font-semibold text-[#3b2116] hover:bg-[#fffaf0]">Next</Link>}</div></nav>
    </section>
  </section>;
}

const fieldClass = "min-h-11 w-full rounded-xl border border-[#d8bc9a] bg-white px-3 text-base text-[#3b2116] shadow-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-200";
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <label htmlFor={htmlFor} className="grid gap-2 text-sm font-semibold text-[#3b2116]">{label}{children}</label>; }
