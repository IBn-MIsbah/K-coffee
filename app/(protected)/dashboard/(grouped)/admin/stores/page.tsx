import { requirePermission } from "@/lib/authz";
import { listAdminStores } from "@/lib/admin/store-service";
import type { StoreHours } from "@/lib/admin/store-validation";
import StoreManager from "./store-manager";

export default async function StoresPage() {
  await requirePermission({ action: "manage", resource: "stores" });
  const stores = await listAdminStores();
  return <StoreManager initialStores={stores.map(({ hours, ...store }) => ({
    ...store,
    hours: hours as StoreHours,
  }))} />;
}
