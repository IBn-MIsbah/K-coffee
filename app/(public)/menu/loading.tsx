import MenuItemSkeleton from "@/components/menu/MenuItemsSkeloton";

export default function MenuLoading() {
  return (
    <main className="min-h-dvh bg-[#f7f1e6] pb-16 pt-28 sm:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-64 rounded-[2rem] border border-[#ead9bf] bg-[#fffaf0] sm:h-52" />
        <div className="mt-7 h-44 rounded-[1.5rem] border border-[#ead9bf] bg-white/80" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <MenuItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
