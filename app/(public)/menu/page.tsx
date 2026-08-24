import { MenuCatalogue } from "@/components/menu/MenuCatalogue";
import { menuHref } from "@/lib/menu/catalogue-types";
import { getPublicMenuCatalogue, parseMenuFilters } from "@/lib/menu/public-catalogue";

type MenuPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const filters = parseMenuFilters(await searchParams);
  const catalogue = await getPublicMenuCatalogue(filters);

  return <MenuCatalogue key={menuHref(catalogue.filters)} {...catalogue} />;
}
