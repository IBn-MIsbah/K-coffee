/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { Card, CardDescription, CardTitle } from "../ui/card";
import Link from "next/link";

interface MenuItemsProps {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string | null;
  price: any;
  onAddToCart?: () => void;
}
const MenuItems = ({
  id,
  name,
  description,
  price,
  imageUrl,
  onAddToCart,
}: MenuItemsProps) => {
  const formatPrice = (price: any): string => {
    if (typeof price === "number") {
      return price.toFixed(2);
    }
    if (typeof price === "string") {
      const num = parseFloat(price);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    }
    return "0.00";
  };

  const formattedPrice = formatPrice(price);
  return (
    <Link href={`/menu/${id}`} className="block group">
      <Card className="group p-5 border-0 bg-amber-100 hover:bg-amber-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Image with fallback */}
        <div className="relative overflow-hidden rounded-lg mb-4">
          {imageUrl ? (
            <Avatar className="w-full">
              <AvatarImage
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={imageUrl}
                alt={name}
              />
            </Avatar>
          ) : (
            <div className="h-64 w-full bg-amber-200/50 flex items-center justify-center rounded-lg">
              <span className="text-5xl text-amber-700/30">☕</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 grow">
          <CardTitle className="text-2xl font-bold text-amber-950 line-clamp-1">
            {name}
          </CardTitle>

          {description && (
            <CardDescription className="text-gray-600 line-clamp-2 min-h-10">
              {description}
            </CardDescription>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-2xl text-amber-900">
              ${formattedPrice}
            </span>

            {/* Optional: Add quantity selector later */}
            {/* <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">-</Button>
            <span className="w-8 text-center">1</span>
            <Button variant="outline" size="icon" className="h-8 w-8">+</Button>
          </div> */}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onAddToCart}
          className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-amber-50 font-semibold text-lg py-6 transition-all duration-300 hover:scale-[1.02] active:scale-95"
          size="lg"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add to Cart
          </span>
        </Button>
      </Card>
    </Link>
  );
};

export default MenuItems;
