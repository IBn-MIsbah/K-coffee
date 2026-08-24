import { MenuProductDetail } from "@/components/menu/MenuProductDetail";
import { menuHref } from "@/lib/menu/catalogue-types";
import {
  getPublicMenuProduct,
  getRelatedPublicMenuProducts,
  parseMenuFilters,
  parseMenuProductId,
} from "@/lib/menu/public-catalogue";
import { notFound } from "next/navigation";

type ProductDetailPageProps = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const [{ productId }, rawSearchParams] = await Promise.all([params, searchParams]);
  const safeProductId = parseMenuProductId(productId);
  if (!safeProductId) notFound();

  const [product, filters] = await Promise.all([
    getPublicMenuProduct(safeProductId),
    Promise.resolve(parseMenuFilters(rawSearchParams)),
  ]);
  if (!product) notFound();

  const relatedProducts = await getRelatedPublicMenuProducts(product.category.id, product.id);

  return (
    <MenuProductDetail
      product={product}
      relatedProducts={relatedProducts}
      backHref={menuHref(filters)}
    />
  );
}
