import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
  return <main className="grid min-h-dvh place-items-center bg-[#f7f1e6] px-4 py-24 text-center sm:px-6"><section className="max-w-xl rounded-3xl border border-[#ead9bf] bg-[#fffaf0] p-8 shadow-[0_18px_45px_rgba(88,49,22,.08)] sm:p-10"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#a56328]">Careers</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-.04em] text-[#2c1911]">No roles are published right now.</h1><p className="mt-4 leading-7 text-[#725b4c]">When K-Coffee has an open role, it will be listed here with the job details and application process.</p><Button asChild variant="outline" className="mt-7 min-h-11 rounded-full border-[#dfc6a9] bg-white text-[#3b2116] hover:bg-[#f7ebd8]"><Link href="/locations">View locations</Link></Button></section></main>;
}
