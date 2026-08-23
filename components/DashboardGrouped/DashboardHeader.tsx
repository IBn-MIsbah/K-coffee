"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
const labels: Record<string, string> = {
  "/dashboard/admin": "Admin overview",
  "/dashboard/admin/orders": "Order operations",
  "/dashboard/cashier": "Pickup queue",
  "/dashboard/profile": "Profile",
  "/dashboard/orders": "My orders",
  "/dashboard/admin/staff": "Staff access",
  "/dashboard/admin/audit": "Audit log",
};
export default function DashboardHeader() {
  const path = usePathname();
  return (
    <header className="flex min-h-16 items-center gap-4 border-b border-[#ead9bf] bg-[#fffaf0] px-4 sm:px-6">
      <SidebarTrigger aria-label="Toggle navigation" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a56328]">
          K-Coffee
        </p>
        <h1 className="text-base font-extrabold text-[#2c1911]">
          {labels[path] ?? "K-Coffee dashboard"}
        </h1>
      </div>
    </header>
  );
}
