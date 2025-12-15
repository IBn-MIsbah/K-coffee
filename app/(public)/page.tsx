import PopularItemsCard from "@/components/Home/componenets/PopularItemsCard";
import { PopularItemsCardSkeleton } from "@/components/Home/skeloton/PopularItemsCardSkeloton";
import { Button } from "@/components/ui/button";
import {
  Coffee,
  Coffee as CoffeeIcon,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[url(/img/Hero3.png)] min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px] bg-no-repeat bg-cover bg-center">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-center h-full p-6 sm:p-10 md:p-16 lg:px-28 lg:py-20">
          {/* Logo/Brand Name */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8 md:mb-10">
            <CoffeeIcon className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-amber-300" />
            <div className="flex flex-col font-bold">
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-amber-100">
                K-COFFEE
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-amber-100">
                SHOP
              </span>
            </div>
          </div>

          {/* Slogans and Tagline */}
          <div className="flex flex-col space-y-4 sm:space-y-6 md:space-y-8 max-w-2xl lg:max-w-3xl">
            <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight text-amber-50">
              Brewed for You,
              <span className="block text-amber-300">Daily.</span>
            </h1>
            <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight text-amber-300">
              Experience the Difference.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-amber-100 max-w-xl">
              Crafted with passion, served with a smile. Every cup tells a
              story.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-8">
              <Button className="rounded-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg md:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <Coffee className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                <Link href={"/dashboard"}>Order Online </Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-2 border-amber-400 text-amber-400 hover:bg-amber-400/10 font-bold px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg md:text-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href={"/menu"}>View Our Menu</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Quick Info Bar - Mobile */}
      <div className="md:hidden bg-amber-800 py-4 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-amber-100 text-sm font-medium">
                Open 7AM-10PM
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-amber-100 text-sm font-medium">
                (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Items Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-linear-to-b from-stone-50 to-stone-100">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold text-amber-950 mb-4 tracking-wider">
              POPULAR MENU ITEMS
            </h2>
            <p className="text-stone-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4">
              Discover our most loved creations, crafted with the finest
              ingredients
            </p>
            <div className="w-24 h-1 bg-amber-600 mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Products Grid */}

          <Suspense fallback={<PopularItemsCardSkeleton />}>
            <PopularItemsCard />
          </Suspense>

          {/* View More Button */}
          <div className="text-center mt-12 sm:mt-16 md:mt-20">
            <Button
              variant="outline"
              className="rounded-full border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-amber-50 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300"
            >
              <Link href={"/menu"}>View Full Menu </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial/Featured Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-amber-800/10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-linear-to-r from-amber-900 to-amber-800 rounded-3xl p-8 sm:p-10 md:p-12 lg:p-16 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
              <div className="lg:w-1/2">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-50 mb-4">
                  Artisan Coffee Experience
                </h3>
                <p className="text-amber-100 text-base sm:text-lg md:text-xl mb-6">
                  Each bean is carefully sourced from sustainable farms and
                  roasted to perfection in our local facility. Our baristas are
                  trained to bring out the unique flavors in every cup.
                </p>
                <ul className="space-y-3">
                  {[
                    "Single-Origin Beans",
                    "Handcrafted Brews",
                    "Sustainable Sourcing",
                    "Expert Baristas",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-amber-100"
                    >
                      <div className="w-2 h-2 bg-amber-300 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-stone-900 rounded-2xl p-6 shadow-inner">
                  <div className="aspect-video bg-stone-800 rounded-lg flex items-center justify-center">
                    <Coffee className="w-20 h-20 text-amber-600 opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-linear-to-br from-amber-800 via-amber-900 to-amber-950 py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-amber-50 mb-6 sm:mb-8 leading-tight">
            Ready for Your Perfect Cup?
          </h2>
          <p className="text-amber-200 text-lg sm:text-xl md:text-2xl mb-10 sm:mb-12 max-w-2xl mx-auto">
            Join thousands of coffee lovers who start their day with our special
            brews
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8">
            <Button className="rounded-full font-bold bg-amber-400 hover:bg-amber-500 text-amber-950 px-10 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl md:text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl">
              <Coffee className="w-6 h-6 sm:w-7 sm:h-7 mr-3" />
              <Link href={"/dashboard"}>Order Online </Link>
            </Button>

            <Button className="rounded-full font-bold bg-transparent border-2 border-amber-400 text-amber-400 hover:bg-amber-400/10 px-10 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl md:text-2xl transition-all duration-300 transform hover:scale-105">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 mr-3" />
              Visit Us Today
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-16 sm:mt-20 md:mt-24">
            {[
              { value: "10K+", label: "Happy Customers" },
              { value: "50+", label: "Coffee Varieties" },
              { value: "5", label: "Locations" },
              { value: "15", label: "Years Serving" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-300 mb-2">
                  {stat.value}
                </div>
                <div className="text-amber-100 text-sm sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
    </>
  );
}
