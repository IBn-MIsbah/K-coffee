import { requirePageRole } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

export default async function AuditPage() {
  await requirePageRole([UserRole.SUPERADMIN], "/dashboard/admin/audit");
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, action: true, resource: true, resourceId: true, userRole: true, createdAt: true, user: { select: { name: true, email: true } } } });
  return <section className="mx-auto max-w-6xl"><p className="text-sm font-semibold text-amber-700">Superadmin only</p><h1 className="mt-1 text-3xl font-bold text-amber-950">Audit log</h1><p className="mt-2 text-slate-600">The 100 most recent operational events. Sensitive session and payment data is never displayed.</p><div className="mt-6 overflow-x-auto rounded-2xl border bg-white"><table className="min-w-full text-left text-sm"><thead className="border-b bg-amber-50 text-amber-950"><tr><th className="p-4">When</th><th className="p-4">Actor</th><th className="p-4">Action</th><th className="p-4">Resource</th><th className="p-4">Role</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-b last:border-0"><td className="p-4 whitespace-nowrap">{log.createdAt.toLocaleString("en-ET", { timeZone: "Africa/Addis_Ababa", dateStyle: "medium", timeStyle: "short" })}</td><td className="p-4">{log.user?.name ?? log.user?.email ?? "System"}</td><td className="p-4">{log.action}</td><td className="p-4">{log.resource}{log.resourceId ? ` · ${log.resourceId}` : ""}</td><td className="p-4">{log.userRole}</td></tr>)}{!logs.length && <tr><td colSpan={5} className="p-8 text-center text-slate-600">No audit events yet.</td></tr>}</tbody></table></div></section>;
}
