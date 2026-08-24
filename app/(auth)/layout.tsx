import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Coffee, ShieldCheck, ShoppingBag } from "lucide-react";

const benefits = [
  { icon: ShoppingBag, label: "Order ahead for pickup" },
  { icon: CheckCircle2, label: "Choose a convenient 20-minute pickup time" },
  { icon: ShieldCheck, label: "Keep your account and orders in one place" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative isolate min-h-dvh w-full min-w-0 flex-1 overflow-x-hidden bg-[#fffaf2] text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-1/3 size-72 rounded-full bg-amber-200/45 blur-3xl dark:bg-amber-700/15" />
        <div className="absolute -right-24 top-0 size-80 rounded-full bg-orange-200/40 blur-3xl dark:bg-orange-700/15" />
      </div>

      <div className="relative mx-auto grid min-h-dvh w-full max-w-[1440px] lg:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)]">
        <aside className="relative hidden overflow-hidden bg-[#3b1f14] px-10 py-10 text-[#fff8ec] lg:flex lg:flex-col xl:px-16">
          <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,245,225,.22)_1px,transparent_0)] [background-size:24px_24px]" />
          <div aria-hidden="true" className="absolute -right-20 top-24 size-80 rounded-full border border-amber-100/20 bg-amber-200/10" />
          <div aria-hidden="true" className="absolute -bottom-24 left-20 size-96 rounded-full border border-orange-100/15 bg-orange-300/10" />

          <Link
            href="/"
            className="relative inline-flex w-fit items-center gap-3 rounded-xl p-1 text-sm font-semibold text-[#fff8ec] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-amber-300 text-[#3b1f14] shadow-lg shadow-black/15">
              <Coffee aria-hidden="true" className="size-5" />
            </span>
            <span>K-Coffee</span>
          </Link>

          <div className="relative my-auto max-w-xl py-14">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Made for your coffee rhythm</p>
            <p className="mt-5 text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.055em] xl:text-6xl">
              Your next cup, on your schedule.
            </p>
            <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-amber-50/80 xl:text-lg">
              Sign in to save your details, review recent orders, and make pickup ordering feel effortless.
            </p>

            <ul className="mt-10 space-y-4" aria-label="K-Coffee account benefits">
              {benefits.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm font-medium text-amber-50/95">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <Icon aria-hidden="true" className="size-4 text-amber-200" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-sm text-amber-100/70">Pickup ordering · Pay at pickup · Ethiopia</p>
        </aside>

        <section className="relative flex min-w-0 items-start justify-center px-4 py-5 sm:px-6 sm:py-8 lg:items-center lg:px-10 xl:px-16">
          <div className="w-full max-w-[31rem]">
            <Link
              href="/"
              className="mb-7 inline-flex min-h-11 items-center gap-3 rounded-xl px-1 text-sm font-semibold text-stone-800 transition-colors hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700 dark:text-stone-100 dark:hover:text-amber-200 lg:hidden"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-200/70 dark:bg-amber-950/60 dark:text-amber-200 dark:ring-amber-800">
                <Coffee aria-hidden="true" className="size-5" />
              </span>
              <span>K-Coffee</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 dark:text-stone-400">
                Home <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </span>
            </Link>

            <div className="auth-card-enter rounded-[1.75rem] border border-amber-950/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(75,38,18,0.12)] backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-stone-900/85 dark:shadow-black/20">
              {children}
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-stone-500 dark:text-stone-400">
              K-Coffee is currently in development. Service details may change before launch.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
