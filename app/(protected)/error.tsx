"use client";

import { Button } from "@/components/ui/button";

export default function ProtectedError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-[50vh] place-items-center p-6 text-center"><div><h1 className="text-2xl font-bold">We could not load this area.</h1><p className="mt-2 text-muted-foreground">Please try again. If the problem continues, contact an administrator.</p><Button className="mt-5" onClick={reset}>Try again</Button></div></main>
  );
}
