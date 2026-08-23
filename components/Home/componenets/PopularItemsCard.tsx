import prisma from "@/lib/prisma";
import { Coffee } from "lucide-react";
import Link from "next/link";

const PopularItemsCard = async () => {
  const products = await prisma.product.findMany({
    take: 3,
    where: { isActive: true, category: { isActive: true } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid grid-cols-1 gap-9 sm:grid-cols-3 sm:gap-6">
      {products.map((product) => (
        <Link href={`/menu/${product.id}`} key={product.id} className="group mx-auto block w-full max-w-[230px] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a56328] focus-visible:ring-offset-4">
          <div className="relative aspect-square overflow-hidden rounded-full bg-[#ead9bf] shadow-[0_10px_22px_rgba(76,37,15,.16)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center bg-[#ead9bf] text-[#9b5b2a]"><Coffee aria-hidden="true" className="size-12" /></div>
            )}
          </div>
          <h3 className="mt-5 text-base font-extrabold text-[#3b2116] group-hover:text-[#9b5828]">{product.name}</h3>
          {product.description && <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#816b5b]">{product.description}</p>}
        </Link>
      ))}
    </div>
  );
};

export default PopularItemsCard;
