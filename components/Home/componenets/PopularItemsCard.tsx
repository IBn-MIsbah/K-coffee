import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";
import MotionCard from "./MotionCard";

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const PopularItemsCard = async () => {
  // await delay(5000);
  const products = await prisma.product.findMany({
    take: 8, // Limit to 8 products for better display
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
      {products.map((p, index) => (
        <Link href={`/menu/${p.id}`} key={p.id} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">
          <MotionCard index={index}>
            <Card
              className="max-w-sm h-full flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-200 ease-out motion-reduce:transition-none border border-amber-100"
            >
            <Avatar className="flex justify-center items-center mb-6">
              {p.imageUrl ? (
                <AvatarImage
                  className="rounded-full w-56 h-56 object-cover ring-4 ring-amber-200 shadow-md cursor-pointer"
                  src={p.imageUrl}
                  id={p.id}
                  alt={p.name}
                />
              ) : (
                <div className="rounded-full w-56 h-56 bg-amber-100 flex items-center justify-center text-amber-900 font-bold text-lg border-2 border-amber-300">
                  [Image Unavailable]
                </div>
              )}
            </Avatar>

            <CardTitle
              className="text-3xl font-serif font-bold text-amber-950 mb-2 tracking-wide cursor-pointer"
              id={p.id}
            >
              {p.name}
            </CardTitle>
            {p.description && (
              <CardDescription className="text-base text-amber-800 italic px-2">
                {p.description}
              </CardDescription>
            )}
            </Card>
          </MotionCard>
        </Link>
      ))}
    </div>
  );
};

export default PopularItemsCard;
