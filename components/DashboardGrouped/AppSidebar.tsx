"use client";
import {
  Coffee,
  IdCardLanyard,
  LucideLayoutDashboard,
  Settings,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppSidebarProps {
  role: string | null | undefined;
}

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LucideLayoutDashboard,
    roles: ["SUPERADMIN", "ADMIN", "CASHIER"], // Optional: Role-based access
  },
  {
    title: "Order",
    url: "/order",
    icon: UtensilsCrossed,
    roles: ["SUPERADMIN", "ADMIN", "CASHIER"],
  },
  {
    title: "Customers",
    url: "/customers",
    icon: UsersRound,
    roles: ["SUPERADMIN", "ADMIN"],
  },
  {
    title: "Staff",
    url: "/staff",
    icon: IdCardLanyard,
    roles: ["SUPERADMIN"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["SUPERADMIN", "ADMIN"],
  },
];

const AppSidebar = ({ role }: AppSidebarProps) => {
  const pathname = usePathname();

  // Helper to check if item is active
  const isActive = (url: string) => {
    if (url === "/dashboard/admin") {
      return pathname === "/dashboard";
    }
    // For nested routes, check if pathname starts with the URL
    return pathname.startsWith(url);
  };

  // Filter items based on user role (optional)
  const filteredItems = items.filter((item) => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  return (
    <Sidebar className="py-4 pl-4">
      <SidebarHeader className="flex flex-row items-center font-extrabold">
        <span className="w-12 h-12 flex justify-center items-center rounded-full">
          <Coffee className="text-amber-600" />
        </span>
        <div className="flex flex-col">
          <span className="text-2xl text-amber-950/90">K-Coffee</span>
          <span className="text-sm font-semibold text-amber-950/90">
            Management console
          </span>
        </div>
      </SidebarHeader>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {filteredItems.map((item) => {
              const active = isActive(item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-all duration-200 ${
                      active
                        ? "text-amber-600 border-l-4 border-amber-600 bg-amber-600/10 font-semibold"
                        : "text-gray-600 hover:text-amber-600 hover:bg-amber-600/5"
                    }`}
                    isActive={active}
                  >
                    <Link href={item.url}>
                      <item.icon className={active ? "text-amber-600" : ""} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Sidebar>
  );
};

export default AppSidebar;
