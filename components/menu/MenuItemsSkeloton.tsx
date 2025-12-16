import { Skeleton } from "../ui/skeleton";

const MenuItemSkeleton = () => {
  return (
    <div className="p-5 border-0 bg-amber-100 rounded-lg shadow-sm">
      {/* Image skeleton */}
      <Skeleton className="h-64 w-full rounded-lg mb-4" />

      <div className="space-y-3">
        {/* Name skeleton */}
        <Skeleton className="h-7 w-3/4 rounded-md bg-amber-200" />

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded bg-amber-200" />
          <Skeleton className="h-4 w-4/5 rounded bg-amber-200" />
          <Skeleton className="h-4 w-3/5 rounded bg-amber-200" />
        </div>

        {/* Price skeleton */}
        <Skeleton className="h-6 w-20 rounded bg-amber-200" />
      </div>

      {/* Button skeleton */}
      <div className="mt-4 pt-4 border-t border-amber-300/50">
        <Skeleton className="h-10 w-full rounded-full bg-amber-500/30" />
      </div>
    </div>
  );
};

export default MenuItemSkeleton;
