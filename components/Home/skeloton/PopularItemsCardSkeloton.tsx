import { Skeleton } from "@/components/ui/skeleton";

export const PopularItemsCardSkeleton = () => {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[1.5rem] border border-[#e5cfad] bg-[#fffdf8] shadow-[0_14px_35px_rgba(76,37,15,.08)]"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none bg-[#ead9bf]" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4 bg-[#efe2ce]" />
            <Skeleton className="h-4 w-full bg-[#f4eadd]" />
            <Skeleton className="h-4 w-2/3 bg-[#f4eadd]" />
            <Skeleton className="mt-5 h-11 w-full rounded-xl bg-[#e5cfad]" />
          </div>
        </div>
      ))}
    </div>
  );
};
