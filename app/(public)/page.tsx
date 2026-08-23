import PopularItemsCard from "@/components/Home/componenets/PopularItemsCard";
import { PopularItemsCardSkeleton } from "@/components/Home/skeloton/PopularItemsCardSkeloton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, MapPin, Quote, Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentActor } from "@/lib/authz";
import { UserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const actor = await getCurrentActor();
  if (actor?.role === UserRole.CASHIER) redirect("/pos");
  if (actor?.role === UserRole.ADMIN || actor?.role === UserRole.SUPERADMIN) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="overflow-hidden bg-[#f7f1e6] text-[#20130e]">
      <section className="relative isolate min-h-[650px] overflow-hidden bg-[#1e120e] sm:min-h-[720px]">
        <div className="absolute inset-0 bg-[url('/img/Hero-image.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,11,8,.94)_0%,rgba(25,13,9,.76)_46%,rgba(25,13,9,.28)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#1d110d] to-transparent" />
        <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-5 pb-16 pt-32 sm:min-h-[720px] sm:px-8 lg:px-12">
          <div className="max-w-xl">
            <div className="mb-7 flex items-center gap-3 text-[#fff7e9]">
              <span className="grid size-11 place-items-center rounded-full border border-[#f6d38a]/60 bg-[#f4bd4d] text-[#32160b] shadow-lg">
                <Coffee aria-hidden="true" className="size-5" />
              </span>
              <span className="text-sm font-extrabold tracking-[.13em]">
                K-COFFEE SHOP
              </span>
            </div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[.24em] text-[#f6c664]">
              Freshly roasted · locally loved
            </p>
            <h1 className="max-w-lg text-balance text-4xl font-extrabold leading-[1.03] tracking-[-.045em] text-[#fff9ee] sm:text-5xl lg:text-6xl">
              Brewed for You, Daily.{" "}
              <span className="text-[#f6c664]">Experience the Difference.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#f8ead2] sm:text-lg">
              Crafted with passion, served with a smile. Discover coffee made to
              slow you down and brighten your day.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-full bg-[#f4bd4d] px-6 font-bold text-[#30170b] shadow-[0_12px_35px_rgba(0,0,0,.24)] hover:bg-[#ffd26f]"
              >
                <Link href="/menu">
                  Order online{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-[#f8ead2]/60 bg-transparent px-6 font-bold text-[#fff9ee] hover:bg-white/10 hover:text-white"
              >
                <Link href="/locations">Visit our shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-[1.45fr_.9fr] lg:gap-20">
          <div>
            <div className="mb-9 flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">
                  Made with care
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em] text-[#2c1911] sm:text-4xl">
                  Popular menu items
                </h2>
              </div>
              <Link
                href="/menu"
                className="hidden items-center gap-1 text-sm font-bold text-[#8d4d20] underline-offset-4 hover:underline sm:flex"
              >
                Full menu <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <Suspense fallback={<PopularItemsCardSkeleton />}>
              <PopularItemsCard />
            </Suspense>
            <Link
              href="/menu"
              className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-[#8d4d20] underline-offset-4 hover:underline sm:hidden"
            >
              Browse the full menu{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <aside className="self-center rounded-[1.75rem] border border-[#ead9bf] bg-[#fffaf0] p-7 shadow-[0_18px_45px_rgba(88,49,22,.10)] sm:p-9">
            <Quote aria-hidden="true" className="size-8 text-[#d78b35]" />
            <p className="mt-5 text-xl font-semibold leading-8 tracking-[-.02em] text-[#432519]">
              “This isn&apos;t just a coffee shop — it&apos;s the calmest part
              of my morning.”
            </p>
            <div
              className="mt-7 flex items-center gap-1 text-[#e5a137]"
              aria-label="Five star review"
            >
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  aria-hidden="true"
                  className="size-4 fill-current"
                />
              ))}
            </div>
            <div className="mt-5 border-t border-[#ead9bf] pt-5">
              <p className="font-bold text-[#442619]">Sara A.</p>
              <p className="mt-1 text-sm text-[#7b604e]">Regular since 2021</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#b56527] px-5 py-16 text-center text-[#fff9ee] sm:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#ffe0a1]">
            Call to action
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-[-.04em] sm:text-5xl">
            Ready for your coffee?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#fff0d5]">
            Order your favourites ahead or step inside for a warm welcome and a
            perfectly made cup.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-11 rounded-full bg-[#fff8e9] px-6 font-bold text-[#8a431a] hover:bg-white"
            >
              <Link href="/menu">Order online</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-[#fff0d5]/70 bg-transparent px-6 font-bold text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/locations">
                <MapPin aria-hidden="true" className="size-4" /> Find a location
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
