export const menuSortOptions = ["latest", "price-asc", "price-desc"] as const;

export type MenuSort = (typeof menuSortOptions)[number];

export type MenuFilters = {
  category?: string;
  q?: string;
  sort: MenuSort;
  page: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

export type MenuProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: Pick<MenuCategory, "id" | "name" | "slug">;
};

export type PublicMenuCatalogue = {
  categories: MenuCategory[];
  products: MenuProduct[];
  total: number;
  pageSize: number;
  filters: MenuFilters;
};

export function menuHref(filters: MenuFilters) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.q) params.set("q", filters.q);
  if (filters.sort !== "latest") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));

  const query = params.toString();
  return query ? `/menu?${query}` : "/menu";
}
