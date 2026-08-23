import { Clock3, Coffee, MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const principles = [
  { icon: Coffee, title: "A focused menu", description: "Browse the available coffee and food menu before you build your pickup order." },
  { icon: Clock3, title: "Pickup on your schedule", description: "Select an available store and a pickup time within that location's operating hours." },
  { icon: MapPin, title: "Local by design", description: "Store availability, prices in ETB, VAT, and pickup intervals are managed for each location." },
];

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-[#f7f1e6] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <header className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">About K-Coffee</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-.04em] text-[#2c1911] sm:text-5xl lg:text-6xl">Coffee ordering, made clear and ready for pickup.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#725b4c]">K-Coffee is a development-stage pickup ordering service. It helps customers explore the active menu, choose a location and time, and place an authenticated order to pay for at pickup.</p>
          </header>

          <aside className="rounded-3xl border border-[#e3c69e] bg-[#fff3d8] p-6 shadow-[0_18px_45px_rgba(88,49,22,.08)] sm:p-8">
            <p className="text-sm font-bold text-[#663516]">What is available today</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#725b4c]">
              <li>Authenticated customer accounts for pickup ordering.</li>
              <li>Pay at pickup — no online card or bank payments.</li>
              <li>Location-specific availability using Ethiopia-local working hours.</li>
            </ul>
            <p className="mt-5 border-t border-[#e3c69e] pt-4 text-xs leading-5 text-[#825830]">This page will be revised with the approved K-Coffee business story and team information before production launch.</p>
          </aside>
        </div>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-6 shadow-[0_18px_45px_rgba(88,49,22,.08)]"><span className="grid size-11 place-items-center rounded-full bg-[#f5dfba] text-[#9b5828]"><Icon aria-hidden="true" className="size-5" /></span><h2 className="mt-5 text-xl font-extrabold text-[#3b2116]">{title}</h2><p className="mt-2 leading-7 text-[#725b4c]">{description}</p></article>)}
        </section>

        <section className="mt-14 rounded-3xl bg-[#3b2116] px-6 py-8 text-[#fff6e9] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#f2bd7a]">Ready when you are</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">See what is available for pickup.</h2></div>
            <Button asChild className="min-h-11 shrink-0 rounded-full bg-[#f0a64a] px-5 font-bold text-[#3b2116] hover:bg-[#ffc06f]"><Link href="/menu"><ShoppingBag aria-hidden="true" className="size-4" /> Browse menu</Link></Button>
          </div>
        </section>
      </section>
    </main>
  );
}
