"use client";

import {
  BookUser,
  Contact,
  Home,
  List,
  MapPin,
  Menu,
  ShoppingCart,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const Header = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const Items = [
    { label: "Home", icon: Home, url: "/" },
    { label: "Menu", icon: List, url: "/menu" },
    { label: "About Us", icon: BookUser, url: "/about" },
    { label: "Locations", icon: MapPin, url: "/locations" },
    { label: "Contact", icon: Contact, url: "/contact" },
  ];

  const toggleSidebar = () => setIsOpen((p) => !p);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out flex justify-center ${
        isScrolled ? "pt-4 px-4" : "pt-0 px-0"
      }`}
    >
      <nav
        className={`transition-all duration-500 ease-in-out flex justify-between items-center px-4 md:px-12
        ${
          isScrolled
            ? "w-[600px] max-w-5xl bg-black/60 backdrop-blur-md rounded-4xl border border-white/10 shadow-2xl p-4"
            : "w-full bg-linear-to-b from-black.70 to-transparent p-6"
        }
        `}
      >
        {/* 1. LOGO / BRAND (Left Side) */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center md:hidden">
            <span className="text-amber-900 font-bold text-sm">K</span>
          </div>
          <span className="text-lg font-serif font-bold text-amber-100 md:hidden">
            K-Coffee
          </span>
        </Link>

        {/* 2. DESKTOP NAV (Center/Left) */}
        <div className="text-amber-100 gap-6 lg:gap-8 hidden md:flex items-center">
          {Items.map((item) => (
            <Link
              key={item.label}
              className="font-medium tracking-wide hover:text-amber-400 transition duration-300 ease-in-out hover:scale-105 text-base lg:text-lg"
              href={item.url}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 3. TABLET & MOBILE CONTROLS (Right Side) */}
        <div className="flex items-center space-x-4 ml-auto md:ml-0">
          {/* Tablet Icons (Visible only on sm to md) */}
          <div className="hidden sm:flex md:hidden items-center space-x-4 mr-2">
            <Link
              href="/menu"
              className="text-amber-100 hover:text-amber-400 transition"
            >
              <List className="w-6 h-6" />
            </Link>
          </div>

          {/* THE BURGER MENU (Visible on Mobile & Tablet) */}
          <button
            onClick={toggleSidebar}
            className="md:hidden bg-amber-600 hover:bg-amber-700 text-amber-100 p-2 rounded-lg transition duration-300 flex items-center space-x-2"
          >
            <span className="hidden sm:inline text-sm font-bold px-1">
              MENU
            </span>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* --- SIDEBAR LOGIC --- */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-linear-to-b from-amber-900 to-amber-950 shadow-2xl transform transition-transform duration-300 ease-in-out z-[60] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-amber-900 font-extrabold text-lg">K</span>
              </div>
              <span className="text-xl font-serif font-bold text-amber-100">
                Coffee-shop
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="bg-amber-800 hover:bg-amber-700 text-amber-100 p-2 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-2">
              {Items.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <li key={index}>
                    <Link
                      href={item.url}
                      onClick={toggleSidebar}
                      className="flex items-center gap-4 text-amber-100 text-lg font-semibold hover:text-amber-300 p-4 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <IconComponent className="w-5 h-5 text-amber-500" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-amber-800/50">
            <Link href="/cart" onClick={toggleSidebar}>
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold py-4 rounded-xl transition flex items-center justify-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>View Cart (0)</span>
              </button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
      )}
    </header>
  );
};

export default Header;
