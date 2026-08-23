import { MapPin, Phone } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const stores = await prisma.storeLocation.findMany({ where: { isActive: true }, select: { id: true, name: true, address: true, phone: true }, orderBy: { name: "asc" } });
  return <main className="min-h-dvh bg-[#f7f1e6] px-4 pb-16 pt-28 sm:px-6"><section className="mx-auto max-w-4xl"><header className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">Get in touch</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-.04em] text-[#2c1911] sm:text-5xl">Contact a K-Coffee location</h1><p className="mt-4 text-lg leading-8 text-[#725b4c]">For pickup questions, please contact the location handling your order. Have your order number ready so the team can assist you.</p></header>{stores.length === 0 ? <p className="mt-10 rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-8 text-center text-[#725b4c]">Contact details will be available once a location is active.</p> : <div className="mt-10 grid gap-5 sm:grid-cols-2">{stores.map((store) => <article key={store.id} className="rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-6 shadow-[0_18px_45px_rgba(88,49,22,.08)]"><h2 className="text-xl font-extrabold text-[#3b2116]">{store.name}</h2><p className="mt-3 flex gap-2 text-sm leading-6 text-[#725b4c]"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#a56328]" /> {store.address}</p><a href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} className="mt-5 inline-flex items-center gap-2 font-bold text-[#8d4d20] underline"><Phone aria-hidden="true" className="size-4" /> {store.phone}</a></article>)}</div>}</section></main>;
}
