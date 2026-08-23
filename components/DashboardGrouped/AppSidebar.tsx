"use client";
import {
  ClipboardList,
  Coffee,
  FolderCog,
  IdCardLanyard,
  LayoutDashboard,
  ReceiptText,
  Store,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
type Item = {
  title: string;
  url: string;
  icon: typeof UserRound;
  roles: string[];
  exact?: boolean;
};
const work: Item[] = [
  {
    title: "My orders",
    url: "/dashboard/orders",
    icon: ReceiptText,
    roles: ["SUPERADMIN", "ADMIN", "CASHIER", "USER"],
    exact: true,
  },
  {
    title: "Admin overview",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
    roles: ["SUPERADMIN", "ADMIN"],
    exact: true,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: UserRound,
    roles: ["SUPERADMIN", "ADMIN", "CASHIER", "USER"],
    exact: true,
  },
  {
    title: "Pickup queue",
    url: "/dashboard/cashier",
    icon: UtensilsCrossed,
    roles: ["SUPERADMIN", "ADMIN", "CASHIER"],
    exact: true,
  },
];
const admin: Item[] = [
  {
    title: "Catalogue",
    url: "/dashboard/admin/catalogue",
    icon: FolderCog,
    roles: ["SUPERADMIN", "ADMIN"],
  },
  {
    title: "Stores",
    url: "/dashboard/admin/stores",
    icon: Store,
    roles: ["SUPERADMIN", "ADMIN"],
  },
  {
    title: "Staff access",
    url: "/dashboard/admin/staff",
    icon: IdCardLanyard,
    roles: ["SUPERADMIN"],
  },
  {
    title: "Audit log",
    url: "/dashboard/admin/audit",
    icon: ClipboardList,
    roles: ["SUPERADMIN"],
  },
];
export default function AppSidebar({
  role,
  name,
}: {
  role: string | null | undefined;
  name?: string | null;
}) {
  const path = usePathname();
  const visible = (items: Item[]) =>
    items.filter((i) => role && i.roles.includes(role));
  const menu = (items: Item[]) => (
    <SidebarMenu>
      {visible(items).map((i) => (
        <SidebarMenuItem key={i.url}>
          <SidebarMenuButton
            asChild
            isActive={i.exact ? path === i.url : path.startsWith(i.url)}
            tooltip={i.title}
            className="min-h-11 text-[#725b4c] hover:bg-[#f5dfba] hover:text-[#3b2116] data-[active=true]:bg-[#f5dfba] data-[active=true]:font-bold data-[active=true]:text-[#7d4018]"
          >
            <Link href={i.url}>
              <i.icon aria-hidden="true" className="size-4" />
              <span>{i.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
  return (
    <Sidebar className="border-r border-[#ead9bf] bg-[#fffaf0] p-3">
      <SidebarHeader className="rounded-2xl bg-[#3b2116] p-4 text-[#fff9ee]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#f4bd4d] text-[#3b2116]">
            <Coffee aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-extrabold">K-Coffee</p>
            <p className="text-xs text-[#e9ca9e]">Management console</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>{menu(work)}</SidebarGroupContent>
        </SidebarGroup>
        {visible(admin).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>{menu(admin)}</SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="rounded-2xl border border-[#ead9bf] bg-white p-3">
        <Link
          href="/dashboard/profile"
          className="mb-2 flex min-h-11 items-center gap-3 rounded-xl px-2 hover:bg-[#f7f1e6]"
        >
          <span className="grid size-9 place-items-center rounded-full bg-[#f5dfba] font-bold text-[#7d4018]">
            {(name ?? "K").slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-[#3b2116]">
              {name ?? "K-Coffee account"}
            </span>
            <span className="block text-xs text-[#725b4c]">
              {role?.replaceAll("_", " ")}
            </span>
          </span>
        </Link>
        <LogoutButton className="min-h-11 w-full justify-start text-[#7e271d] hover:bg-red-50 hover:text-[#7e271d]" />
      </SidebarFooter>
    </Sidebar>
  );
}
