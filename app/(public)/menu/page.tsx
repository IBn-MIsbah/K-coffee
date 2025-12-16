/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { api } from "@/api/api-client";
import { Product } from "@/app/generated/prisma/client";
import MenuItems from "@/components/menu/MenuItems";
import MenuItemSkeleton from "@/components/menu/MenuItemsSkeloton";
import { useCallback, useEffect, useState } from "react";

const FILTERS: string[] = [
  "All",
  "Coffee",
  "Brewed Coffee",
  "Tea",
  "Iced Drinks",
  "Pastries",
];

// Helper to convert Decimal to number
const parseDecimal = (value: any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value && typeof value === "object" && "toNumber" in value) {
    return value.toNumber();
  }
  return 0;
};

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);

    let url = "/menu/ap"; // Changed from "/menu/api" - adjust based on your API route

    if (category !== "All") {
      url += `?category=${encodeURIComponent(category)}`;
    }

    try {
      const response = await api.get(url);
      const data = response.data;

      if (data.success) {
        const formattedProducts: Product[] = data.data.map((p: Product) => ({
          ...p,
          price: parseDecimal(p.price), // Convert Decimal to number
        }));
        setProducts(formattedProducts);
      } else {
        setError(data.message || "Failed to load products");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load menu items. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(activeFilter);
  }, [activeFilter, fetchProducts]); // ✅ Added dependencies to prevent infinite loop

  const handleFilterClick = (filterName: string) => {
    setActiveFilter(filterName);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page-specific content */}
        <div className="flex flex-col text-amber-900 text-center mb-6 sm:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4">
            Handcrafted for You
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-2">
            Handcrafted coffee, fresh pastries, and delicious sandwiches made
            just for you.
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our selection of carefully curated items.
          </p>
        </div>

        {/* Filter menu */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-amber-900 font-semibold border-b border-amber-950/10 pb-4 mb-12">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm sm:text-base transition-all duration-200 ${
                activeFilter === filter
                  ? "bg-amber-900 text-white font-bold shadow-lg"
                  : "bg-amber-100 text-amber-900 hover:bg-amber-200"
              }`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <button
              onClick={() => fetchProducts(activeFilter)}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state - Show skeleton grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <MenuItemSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6 text-gray-600">
              <p>
                Showing {products.length}{" "}
                {products.length === 1 ? "item" : "items"}
                {activeFilter !== "All" && ` in "${activeFilter}"`}
              </p>
            </div>

            {/* Products grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <MenuItems
                    key={product.id}
                    name={product.name}
                    imageUrl={product.imageUrl}
                    description={product.description}
                    price={product.price}
                  />
                ))}
              </div>
            ) : (
              // Empty state
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                  <span className="text-2xl">☕</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  {activeFilter !== "All"
                    ? `No "${activeFilter}" items available. Try another filter.`
                    : "No menu items available at the moment."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
