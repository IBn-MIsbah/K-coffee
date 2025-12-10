import Footer from "@/components/Home/componenets/Footer";
import Header from "@/components/Home/componenets/Header";
import PopularItemsCard from "@/components/Home/componenets/PopularItemsCard";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
// import { Product } from "@/types";
import { Coffee } from "lucide-react";

// const popularProducts: Product[] = await prisma.$queryRaw`
//   SELECT
//     p.id, p.name, p."imageUrl", p.description, COUNT(oi.id) AS popularity_count
//   FROM
//     "Product" p
//   JOIN
//     "OrderItem" oi ON p.id = oi."productId"
//   GROUP BY
//     p.id
//   ORDER BY
//     popularity_count DESC
//   LIMIT 5;
// `;
export default async function Home() {
  return (
    <div>
      <section className="bg-[url(/img/Hero3.png)] min-h-96 sm:h-140 bg-no-repeat bg-cover bg-center flex flex-col">
        <Header />
        <div className="flex bg-transparent p-4 sm:px-28 sm:py-10 grow justify-start items-start bg-linear-to-r from-black/60 to-transparent">
          {/* Slogan Container */}
          <div className="bg-transparent text-amber-100 flex flex-col w-full sm:w-1/2">
            {/* Logo/Brand Name */}
            <div className="flex text-lg sm:text-2xl gap-1">
              <Coffee className="h-10 w-10 sm:h-12 sm:w-12" />
              <div className="flex flex-col font-bold text-lg sm:text-2xl">
                <span>K-COFFEE</span>
                <span>SHOP</span>
              </div>
            </div>

            {/* Slogans and Tagline */}
            <div className="flex flex-col mt-5">
              <span className="font-extrabold text-3xl sm:text-5xl leading-tight">
                Brewed for You, Daily.
              </span>
              <span className="font-extrabold text-3xl sm:text-5xl leading-tight text-amber-300">
                Experince the Difference.
              </span>
              <span className="text-sm sm:text-lg mt-2">
                Crafted with passion, served with a smile.
              </span>
            </div>

            <div className="mt-6">
              <Button className="rounded-3xl bg-amber-100 text-black hover:bg-amber-300 px-8 py-3 text-sm sm:text-base">
                Order Online Now
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-col items-center py-16 px-4 md:py-24 bg-stone-50">
        {/* {card components} */}
        {/* popular items */}
        <div className="text-3xl font-serif font-extrabold text-amber-950 sm:text-4xl pb-10 tracking-wider border-b-4 border-amber-800/50 mb-12">
          POPULAR MENU ITEMS
        </div>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl">
          {(await prisma.product.findMany()).map((p) => (
            <PopularItemsCard
              key={p.id}
              id={p.id}
              name={p.name}
              imageUrl={p.imageUrl}
              description={p.description}
            />
          ))}
        </div>
      </section>
      <section>
        {/* footer and social links */}
        {/**call to action buttons  */}
        <div className="flex flex-col justify-center items-center bg-amber-800/80 py-16 px-4">
          <div className="font-extrabold text-4xl sm:text-6xl text-amber-100 text-center mb-6">
            Ready for Your Coffee?
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
            <div className="mt-4">
              <Button className="rounded-full font-bold bg-amber-100 text-amber-950 hover:bg-amber-300 px-10 py-3 text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                Order Online
              </Button>
            </div>

            <div className="mt-4">
              <Button className="rounded-full font-bold bg-amber-950 text-amber-100 border-2 border-amber-100 hover:bg-amber-900 px-10 py-3 text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                Visit Us Today
              </Button>
            </div>
          </div>
        </div>
        {/**footer */}
        <div className="py-10 bg-amber-950">
          <Footer />
        </div>
      </section>
    </div>
  );
}
