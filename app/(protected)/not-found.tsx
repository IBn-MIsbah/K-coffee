import Link from "next/link";
import { ClipboardX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProtectedNotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-4 py-10 text-center sm:px-6">
      <section className="w-full max-w-lg rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-8 shadow-[0_18px_45px_rgba(88,49,22,.08)]">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f5dfba] text-[#9b5828]"><ClipboardX aria-hidden="true" className="size-7" /></span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#2c1911]">We could not find that item.</h1>
        <p className="mt-2 text-[#725b4c]">It may no longer be available, or you may not have access to it.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="min-h-11 rounded-full bg-[#b56527] font-bold text-white hover:bg-[#934817]"><Link href="/dashboard">Dashboard</Link></Button>
          <Button asChild variant="outline" className="min-h-11 rounded-full border-[#dfc6a9] bg-white text-[#3b2116] hover:bg-[#f7ebd8]"><Link href="/dashboard/orders">My orders</Link></Button>
        </div>
      </section>
    </main>
  );
}
