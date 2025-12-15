import { Skeleton } from "@/components/ui/skeleton";

export const PopularItemsCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
      {/* Map over a placeholder array to render multiple skeleton cards */}
      {[...Array(4)].map((_, index) => (
        <div // Use a regular div as the card container
          key={index}
          className="max-w-sm h-full flex flex-col items-center text-center 
                     bg-white rounded-xl p-6 shadow-lg 
                     border border-amber-100 animate-pulse" // Added animate-pulse for visual feedback
        >
          {/* 1. Image Placeholder */}
          <div className="flex justify-center items-center mb-6">
            {/* The circular image skeleton */}
            <Skeleton className="rounded-full w-56 h-56 ring-4 ring-amber-200 shadow-md" />
          </div>

          {/* 2. Title Placeholder */}
          {/* Replace CardTitle with a horizontal skeleton bar */}
          <Skeleton className="h-8 w-3/4 mb-2" />

          {/* 3. Description Placeholder */}
          {/* Replace CardDescription with a shorter skeleton bar */}
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
};
