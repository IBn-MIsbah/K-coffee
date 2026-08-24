import { Skeleton } from "../ui/skeleton";

const MenuItemSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#e5cfad] bg-[#fffdf8] shadow-[0_14px_35px_rgba(76,37,15,.08)]">
      <Skeleton className="aspect-[4/3] w-full rounded-none bg-[#ead8bd]" />
      <div className="space-y-3 p-5">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-6 w-2/5 bg-[#ead8bd]" />
          <Skeleton className="h-5 w-16 bg-[#ead8bd]" />
        </div>
        <Skeleton className="h-4 w-full bg-[#ead8bd]" />
        <Skeleton className="h-4 w-3/4 bg-[#ead8bd]" />
      </div>
      <div className="flex gap-2 px-5 pb-5">
        <Skeleton className="h-11 flex-1 rounded-xl bg-[#ead8bd]" />
        <Skeleton className="size-11 rounded-xl bg-[#ead8bd]" />
      </div>
    </div>
  );
};

export default MenuItemSkeleton;
