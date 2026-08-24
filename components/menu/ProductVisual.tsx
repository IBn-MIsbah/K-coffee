"use client";

import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";
import { useState } from "react";

const visualTones = [
  "from-[#6a351d] via-[#ae6331] to-[#e8b46a]",
  "from-[#213d3b] via-[#4c8076] to-[#a9c9ae]",
  "from-[#5b2d3c] via-[#9f5764] to-[#e5a09a]",
  "from-[#5e4821] via-[#a8843b] to-[#e9cd82]",
];

type ProductVisualProps = {
  imageUrl: string | null;
  alt?: string;
  index?: number;
  className?: string;
};

export function ProductVisual({
  imageUrl,
  alt = "",
  index = 0,
  className,
}: ProductVisualProps) {
  // Development seed data uses example.com placeholders. Show the intentional
  // illustration instead of exposing a broken image while the catalogue is seeded.
  const [hasImage, setHasImage] = useState(
    Boolean(imageUrl) && !imageUrl?.includes("example.com/"),
  );

  return (
    <div
      aria-hidden={alt ? undefined : true}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br",
          visualTones[index % visualTones.length],
        )}
      />
      <div className="absolute -right-12 -top-12 size-40 rounded-full border border-white/30 bg-white/10" />
      <div className="absolute -bottom-16 -left-8 size-40 rounded-full bg-black/10 blur-2xl" />
      <div className="absolute inset-0 grid place-items-center text-white/80">
        <Coffee aria-hidden="true" className="size-14 stroke-[1.4]" />
      </div>
      {hasImage ? (
        // Product image hosts are administrator-managed and may not be configured
        // Next Image hosts. A failed image falls back to the stable visual above.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl ?? undefined}
          alt={alt}
          onError={() => setHasImage(false)}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10" />
    </div>
  );
}
