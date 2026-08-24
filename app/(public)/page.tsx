import PopularItemsCard from "@/components/Home/componenets/PopularItemsCard";
import { PopularItemsCardSkeleton } from "@/components/Home/skeloton/PopularItemsCardSkeloton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, MapPin } from "lucide-react";
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

      <section className="relative isolate overflow-hidden border-y border-[#e7d2b2] bg-[#fff8ed]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-12 size-80 rounded-full bg-[#f1c982]/20 blur-3xl" />
          <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-[#bd6b31]/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="flex flex-col gap-7 border-b border-[#e4cfaf] pb-10 sm:pb-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">
                Made for pickup
              </p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-[-.04em] text-[#2c1911] sm:text-4xl lg:text-5xl">
                Menu picks for your next pause.
              </h2>
              <p className="mt-4 max-w-xl text-pretty leading-7 text-[#745d4e]">
                A few easy places to start—made to order, ready for your chosen pickup time, and paid for when you arrive.
              </p>
            </div>
            <Button
              asChild
              className="min-h-12 shrink-0 rounded-full bg-[#3b2116] px-6 font-bold text-[#fff9ee] hover:bg-[#5a3020]"
            >
              <Link href="/menu">
                Browse full menu <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-7 xl:grid-cols-[minmax(0,1fr)_18.5rem] xl:items-stretch">
            <Suspense fallback={<PopularItemsCardSkeleton />}>
              <PopularItemsCard />
            </Suspense>

            <aside className="relative overflow-hidden rounded-[1.75rem] bg-[#3b2116] p-7 text-[#fff9ee] shadow-[0_20px_45px_rgba(76,37,15,.18)] sm:p-8 xl:flex xl:flex-col">
              <div aria-hidden="true" className="absolute -right-14 -top-12 size-52 rounded-full border border-[#f8dca8]/20 bg-[#d9934c]/15" />
              <div aria-hidden="true" className="absolute -bottom-20 -left-12 size-48 rounded-full bg-[#f0bd71]/10 blur-2xl" />
              <div className="relative">
                <span className="inline-flex rounded-full border border-[#f8dca8]/25 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-[#f8dca8]">
                  Your pickup rhythm
                </span>
                <h3 className="mt-5 text-2xl font-extrabold leading-8 tracking-[-.03em]">
                  Great coffee, right on time.
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#f7e7cb]/75">
                  Select the slot that works for you, then collect your order and pay at the counter.
                </p>
              </div>
              <dl className="relative mt-8 grid gap-3 border-y border-white/10 py-5">
                <div className="flex items-center gap-3">
                  <dt className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f2bc6d] text-sm font-extrabold text-[#3b2116]">
                    20
                  </dt>
                  <dd className="text-sm font-semibold text-[#fff4df]">Minute pickup intervals</dd>
                </div>
                <div className="flex items-center gap-3">
                  <dt className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#f8dca8]">
                    <Coffee aria-hidden="true" className="size-4" />
                  </dt>
                  <dd className="text-sm font-semibold text-[#fff4df]">Pay at pickup</dd>
                </div>
              </dl>
              <Link
                href="/locations"
                className="relative mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-[#f8dca8] underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8dca8] xl:mt-auto"
              >
                Find a pickup location <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </aside>
          </div>
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
