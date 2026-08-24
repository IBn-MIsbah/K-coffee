"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function MenuError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f1e6] px-4 pb-16 pt-28 sm:pt-32">
      <section className="max-w-lg rounded-[1.75rem] border border-[#ead9bf] bg-[#fffaf0] p-8 text-center shadow-[0_18px_45px_rgba(88,49,22,.1)]">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#fff0d7] text-[#a56328]">
          <AlertCircle aria-hidden="true" className="size-7" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#3b2116]">The menu is taking a moment</h1>
        <p className="mt-3 leading-7 text-[#725b4c]">
          We could not load the current menu. Please retry in a moment.
        </p>
        <Button
          type="button"
          onClick={reset}
          className="mt-6 min-h-11 rounded-xl bg-[#b56527] px-5 font-bold text-white hover:bg-[#934817]"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      </section>
    </main>
  );
}
