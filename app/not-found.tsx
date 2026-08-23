import Link from "next/link";
import { Coffee, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f1e6] px-4 py-12 text-center sm:px-6">
      <section className="w-full max-w-lg rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-8 shadow-[0_18px_45px_rgba(88,49,22,.08)] sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f5dfba] text-[#9b5828]"><SearchX aria-hidden="true" className="size-7" /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">404 · Not found</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#2c1911]">That page is not available.</h1>
        <p className="mt-3 text-[#725b4c]">It may have moved, or the address may be incorrect.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="min-h-11 rounded-full bg-[#b56527] px-5 font-bold text-white hover:bg-[#934817]"><Link href="/"><Coffee aria-hidden="true" className="size-4" /> Home</Link></Button>
          <Button asChild variant="outline" className="min-h-11 rounded-full border-[#dfc6a9] bg-white text-[#3b2116] hover:bg-[#f7ebd8]"><Link href="/menu">Browse menu</Link></Button>
        </div>
      </section>
    </main>
  );
}
