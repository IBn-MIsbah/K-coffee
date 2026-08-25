import { requirePermission } from "@/lib/authz";
import { getAdminOverviewMetrics } from "@/lib/orders/admin-metrics";
import AdminOverview from "./admin-overview";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requirePermission({ action: "view_all", resource: "analytics" });
  const metrics = await getAdminOverviewMetrics();

  return <AdminOverview metrics={metrics} />;
}
