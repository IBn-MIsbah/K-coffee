import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f1e6] px-6 text-center text-[#2c1911]">
      <section className="max-w-md rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-8 shadow-[0_18px_45px_rgba(88,49,22,.10)]">
        <ShieldAlert aria-hidden="true" className="mx-auto size-10 text-[#b56527]" />
        <h1 className="mt-5 text-2xl font-extrabold">Access restricted</h1>
        <p className="mt-3 leading-6 text-[#725b4c]">Your account does not have permission to view this area.</p>
        <Button asChild className="mt-7 rounded-full bg-[#b56527] px-6 font-bold text-white hover:bg-[#934817]"><Link href="/dashboard">Back to dashboard</Link></Button>
      </section>
    </main>
  );
}
