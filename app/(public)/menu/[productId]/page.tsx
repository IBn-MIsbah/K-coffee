/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { api } from "@/api/api-client";
import { Product } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Coffee,
  Clock,
  Thermometer,
  Leaf,
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MenuItemSkeleton from "@/components/menu/MenuItemsSkeloton";
import Image from "next/image";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

interface ProductWithCategory extends Product {
  category?: {
    name: string;
    slug: string;
  };
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/products/${productId}`);
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          toast.error("Product not found");
          router.push("/menu");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
        router.push("/menu");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // TODO: Implement cart API call
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

      toast.success(`Added ${quantity} ${product.name} to cart`, {
        description: `Total: $${((product.price as any) * quantity).toFixed(
          2
        )}`,
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <Button asChild>
            <Link href="/menu">Back to Menu</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-amber-900 hover:text-amber-700"
            asChild
          >
            <Link href="/menu">
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </Link>
          </Button>
        </div>

        {/* Product Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
            {product.imageUrl ? (
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Avatar>
                  <AvatarImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Avatar>
              </div>
            ) : (
              <div className="aspect-square bg-amber-100 rounded-xl flex items-center justify-center">
                <Coffee className="w-32 h-32 text-amber-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Title */}
            <div>
              {product.category && (
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-3">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-amber-700">
                $
                {typeof product.price === "number"
                  ? (product.price as any).toFixed(2)
                  : product.price}
              </p>
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Thermometer className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-gray-700">Hot/Iced Options</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-gray-700">Ready in 5 min</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Leaf className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-gray-700">Fresh Ingredients</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Coffee className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-gray-700">Arabica Beans</span>
              </div>
            </div>

            {/* Customization (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Customize Your Order
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Size</span>
                  <div className="flex gap-2">
                    {["Small", "Medium", "Large"].map((size) => (
                      <button
                        key={size}
                        className="px-4 py-2 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Sweetness</span>
                  <div className="flex gap-2">
                    {["Less", "Normal", "Extra"].map((level) => (
                      <button
                        key={level}
                        className="px-4 py-2 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="text-2xl font-bold text-amber-700">
                    $
                    {(typeof product.price === "number"
                      ? product.price * quantity
                      : parseFloat(product.price as any) * quantity
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full py-6 text-lg font-bold bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addingToCart ? "Adding to Cart..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products (Optional) */}
        <RelatedProducts
          currentProductId={productId as string}
          category={product.category?.slug}
        />
      </div>
    </div>
  );
}

// Loading Skeleton Component
function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          </div>
          {/* Content skeleton */}
          <div className="space-y-6">
            <div>
              <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse mb-4" />
              <div className="w-3/4 h-10 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-4/5 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-3/5 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Related Products Component (Optional)
function RelatedProducts({
  currentProductId,
  category,
}: {
  currentProductId: string;
  category?: string;
}) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) return;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/menu/api?category=${category}`);
        if (response.data.success) {
          const filtered = response.data.data
            .filter((p: Product) => p.id !== currentProductId)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [category, currentProductId]);

  if (!category || relatedProducts.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        You Might Also Like
      </h2>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <MenuItemSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/menu/${product.id}`}
              className="block group"
            >
              <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-lg transition-shadow">
                {product.imageUrl ? (
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                    <Coffee className="w-12 h-12 text-amber-400" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-amber-700 font-bold">
                  $
                  {typeof product.price === "number"
                    ? (product.price as any).toFixed(2)
                    : product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
