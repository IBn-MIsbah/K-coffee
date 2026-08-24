import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f1e6] px-4 pb-16 pt-28 sm:pt-32">
      <section className="max-w-lg rounded-[1.75rem] border border-[#ead9bf] bg-[#fffaf0] p-8 text-center shadow-[0_18px_45px_rgba(88,49,22,.1)]">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f5dfba] text-[#9b5828]">
          <Coffee aria-hidden="true" className="size-7" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#3b2116]">This item is no longer on the menu</h1>
        <p className="mt-3 leading-7 text-[#725b4c]">
          It may have been updated or made unavailable. Explore the current menu to find your
          next pickup order.
        </p>
        <Button
          asChild
          className="mt-6 min-h-11 rounded-xl bg-[#b56527] px-5 font-bold text-white hover:bg-[#934817]"
        >
          <Link href="/menu">Browse the menu</Link>
        </Button>
      </section>
    </main>
  );
}
