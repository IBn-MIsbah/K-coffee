"use client";

import {
  BookUser, Contact, Home, List, LogIn, MapPin, Menu, MonitorCog,
  ReceiptText, ShoppingCart, UserPlus, UserRound, X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import { useSession } from "@/lib/auth-client";
import { getCartItemCount, useCart } from "@/lib/store/useCart";

const navigationItems = [
  { label: "Home", icon: Home, url: "/" },
  { label: "Menu", icon: List, url: "/menu" },
  { label: "About us", icon: BookUser, url: "/about" },
  { label: "Locations", icon: MapPin, url: "/locations" },
  { label: "Contact", icon: Contact, url: "/contact" },
];

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2c1911]";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const pathname = usePathname();
  const cartItemCount = useCart((state) => getCartItemCount(state.items));
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isCustomer = role === "USER";
  const isStaff = role === "CASHIER" || role === "ADMIN" || role === "SUPERADMIN";
  const staffDestination = role === "CASHIER" ? "/pos" : "/admin/dashboard";
  const closeMenu = () => setIsOpen(false);
  const isActive = (url: string) => url === "/" ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) {
        menuButtonRef.current?.focus();
        wasOpenRef.current = false;
      }
      return;
    }
    wasOpenRef.current = true;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 px-3 transition-[padding] duration-200 ease-out motion-reduce:transition-none sm:px-5 ${isScrolled ? "pt-3" : "pt-0"}`}>
      <nav aria-label="Primary navigation" className={`mx-auto flex h-20 w-full max-w-7xl items-center gap-3 px-4 transition-[background-color,border-color,box-shadow,border-radius] duration-200 ease-out motion-reduce:transition-none sm:px-6 ${isScrolled ? "rounded-2xl border border-[#6c4a34]/70 bg-[#2c1911]/95 shadow-[0_12px_32px_rgba(42,23,13,.28)] backdrop-blur" : "bg-gradient-to-b from-black/70 to-transparent"}`}>
        <Link href="/" aria-label="K-Coffee home" className={`flex shrink-0 items-center gap-2.5 rounded-xl py-2 text-amber-50 ${focusRing}`}>
          <span className="grid size-9 place-items-center rounded-xl bg-amber-500 font-serif text-lg font-black text-amber-950 shadow-sm">K</span>
          <span className="font-serif text-lg font-bold tracking-tight sm:text-xl">K-Coffee</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return <Link key={item.url} href={item.url} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${focusRing} ${active ? "bg-white/12 text-amber-200" : "text-amber-50/90 hover:bg-white/10 hover:text-amber-200"}`}><Icon aria-hidden="true" className="size-4" />{item.label}</Link>;
          })}
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-1 xl:flex">
          {!session?.user && <><Link href="/login" className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-amber-50 hover:bg-white/10 ${focusRing}`}><LogIn aria-hidden="true" className="size-4" />Sign in</Link><Link href="/register" className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-500 px-4 text-sm font-bold text-amber-950 transition-colors hover:bg-amber-400 ${focusRing}`}><UserPlus aria-hidden="true" className="size-4" />Register</Link></>}
          {isCustomer && <><Link href="/dashboard/orders" className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-amber-50 hover:bg-white/10 ${focusRing}`}><ReceiptText aria-hidden="true" className="size-4" />Orders</Link><Link href="/dashboard/profile" aria-label="View your profile" className={`grid size-11 place-items-center rounded-full bg-amber-500 text-amber-950 transition-colors hover:bg-amber-400 ${focusRing}`}><UserRound aria-hidden="true" className="size-5" /></Link><LogoutButton showIcon={false} className={`min-h-11 px-3 text-amber-50 hover:bg-white/10 hover:text-white ${focusRing}`} /></>}
          {isStaff && <><Link href={staffDestination} className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-500 px-4 text-sm font-bold text-amber-950 transition-colors hover:bg-amber-400 ${focusRing}`}><MonitorCog aria-hidden="true" className="size-4" />Workspace</Link><LogoutButton showIcon={false} className={`min-h-11 px-3 text-amber-50 hover:bg-white/10 hover:text-white ${focusRing}`} /></>}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 xl:hidden">
          {isCustomer && <Link href="/cart" aria-label={`View cart, ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`} className={`relative grid size-11 place-items-center rounded-full text-amber-50 transition-colors hover:bg-white/10 hover:text-amber-200 ${focusRing}`}><ShoppingCart aria-hidden="true" className="size-5" />{cartItemCount > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-xs font-bold leading-5 text-amber-950">{cartItemCount > 99 ? "99+" : cartItemCount}</span>}</Link>}
          <button ref={menuButtonRef} type="button" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} aria-controls="mobile-navigation" aria-expanded={isOpen} className={`grid size-11 place-items-center rounded-xl bg-amber-500 text-amber-950 transition-colors hover:bg-amber-400 ${focusRing}`}>{isOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}</button>
        </div>
      </nav>

      {isOpen && <button type="button" onClick={closeMenu} aria-label="Close navigation menu" className="fixed inset-0 -z-10 bg-[#1c0e08]/55 backdrop-blur-sm" />}

      <aside id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Navigation menu" aria-hidden={!isOpen} inert={!isOpen} className={`fixed bottom-0 right-0 top-0 w-full max-w-sm border-l border-[#6c4a34] bg-[#2c1911] px-6 py-5 shadow-2xl transition-transform duration-200 ease-out motion-reduce:transition-none ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#6c4a34]/70 pb-5">
            <Link href="/" onClick={closeMenu} className={`flex items-center gap-2.5 rounded-xl ${focusRing}`}><span className="grid size-9 place-items-center rounded-xl bg-amber-500 font-serif text-lg font-black text-amber-950">K</span><span className="font-serif text-xl font-bold text-amber-50">K-Coffee</span></Link>
            <button ref={closeButtonRef} type="button" onClick={closeMenu} aria-label="Close navigation menu" className={`grid size-11 place-items-center rounded-xl text-amber-50 hover:bg-white/10 ${focusRing}`}><X aria-hidden="true" className="size-5" /></button>
          </div>
          <ul className="mt-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              return <li key={item.url}><Link href={item.url} onClick={closeMenu} aria-current={active ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-semibold transition-colors ${focusRing} ${active ? "bg-white/12 text-amber-200" : "text-amber-50 hover:bg-white/10 hover:text-amber-200"}`}><Icon aria-hidden="true" className="size-5" />{item.label}</Link></li>;
            })}
          </ul>
          <div className="mt-auto space-y-2 border-t border-[#6c4a34]/70 pt-5">
            {!session?.user && <><Link href="/login" onClick={closeMenu} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-400/70 text-sm font-bold text-amber-50 hover:bg-white/10 ${focusRing}`}><LogIn aria-hidden="true" className="size-4" />Sign in</Link><Link href="/register" onClick={closeMenu} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-bold text-amber-950 hover:bg-amber-400 ${focusRing}`}><UserPlus aria-hidden="true" className="size-4" />Create account</Link></>}
            {isCustomer && <><Link href="/dashboard/orders" onClick={closeMenu} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-400/70 text-sm font-bold text-amber-50 hover:bg-white/10 ${focusRing}`}><ReceiptText aria-hidden="true" className="size-4" />My orders</Link><Link href="/cart" onClick={closeMenu} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-bold text-amber-950 hover:bg-amber-400 ${focusRing}`}><ShoppingCart aria-hidden="true" className="size-4" />Cart ({cartItemCount})</Link></>}
            {isStaff && <Link href={staffDestination} onClick={closeMenu} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-bold text-amber-950 hover:bg-amber-400 ${focusRing}`}><MonitorCog aria-hidden="true" className="size-4" />Open workspace</Link>}
          </div>
        </div>
      </aside>
    </header>
  );
};

export default Header;
