import { requirePermission } from "@/lib/authz";
import { listAdminCategories, listAdminProducts } from "@/lib/admin/catalogue-service";
import CatalogueManager from "./catalogue-manager";

export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  await requirePermission({ action: "manage", resource: "products" });
  const [categories, products] = await Promise.all([listAdminCategories(), listAdminProducts()]);
  return <CatalogueManager initialCategories={categories} initialProducts={products.map((product) => ({ ...product, price: product.price.toFixed(2) }))} />;
}
