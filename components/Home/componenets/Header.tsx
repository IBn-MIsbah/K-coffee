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
import { useState } from "react";

const Header = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const Items = [
    {
      alias: "Home",
      icon: Home,
      url: "/",
    },
    {
      alias: "Menu",
      icon: List,
      url: "/menu",
    },
    { alias: "About Us", icon: BookUser, url: "/about" },
    { alias: "Locations", icon: MapPin, url: "/locations" },
    { alias: "Contact", icon: Contact, url: "/contact" },
  ];

  const toggleSidebar = () => setIsOpen((p) => !p);

  return (
    <header className="fixed top-0 left-0 w-full z-50 shadow-lg bg-linear-to-b from-black/70 ">
      <nav className="text-slate-50 text-xl px-4 md:px-12 lg:px-28 p-4 md:p-6 flex justify-between items-center">
        {/* Desktop Navigation - Hidden on mobile, visible on md+ */}
        <div className="text-amber-100 gap-6 lg:gap-8 hidden md:flex items-center">
          {Items.map((item) => (
            <Link
              key={item.alias}
              className="font-medium tracking-wide hover:text-amber-400 transition duration-300 ease-in-out hover:scale-105 text-base lg:text-lg"
              href={item.url}
            >
              {item.alias}
            </Link>
          ))}
          <div className="relative ml-4 lg:ml-6">
            <ShoppingCart className="text-amber-100 w-6 h-6 lg:w-7 lg:h-7 hover:text-amber-400 transition duration-300 ease-in-out cursor-pointer" />
            <span className="absolute -top-2 -right-2 bg-amber-500 text-amber-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </div>
        </div>

        {/* Tablet Navigation - Compact version */}
        <div className="hidden sm:flex md:hidden items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-amber-100 hover:text-amber-400 transition duration-300"
            >
              <Home className="w-6 h-6" />
            </Link>
            <Link
              href="/menu"
              className="text-amber-100 hover:text-amber-400 transition duration-300"
            >
              <List className="w-6 h-6" />
            </Link>
            <Link
              href="/cart"
              className="relative text-amber-100 hover:text-amber-400 transition duration-300"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-amber-500 text-amber-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
          <button
            onClick={toggleSidebar}
            className="bg-amber-600 hover:bg-amber-700 text-amber-100 px-4 py-2 rounded-lg font-medium transition duration-300"
          >
            Menu
          </button>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex sm:hidden items-center space-x-4">
          <div className="relative">
            <ShoppingCart className="text-amber-100 w-6 h-6 cursor-pointer" />
            <span className="absolute -top-2 -right-2 bg-amber-500 text-amber-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="bg-amber-600 hover:bg-amber-700 text-amber-100 p-2 rounded-lg transition duration-300"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Tablet/Mobile Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-80 md:w-96 bg-linear-to-b from-amber-800 to-amber-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-60 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } sm:hidden md:hidden`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-amber-900 font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-serif font-bold text-amber-100">
                Restaurant
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="bg-amber-600 hover:bg-amber-700 text-amber-100 p-2 rounded-lg transition duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-4">
              {Items.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <li key={index}>
                    <Link
                      href={item.url}
                      onClick={toggleSidebar}
                      className="flex items-center gap-4 text-amber-100 text-lg font-semibold hover:text-amber-300 p-4 rounded-lg hover:bg-amber-700/50 transition-all duration-300"
                    >
                      <IconComponent className="w-6 h-6" />
                      <span>{item.alias}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Cart Summary in Sidebar */}
          <div className="mt-8 pt-6 border-t border-amber-600">
            <div className="flex items-center justify-between mb-4">
              <span className="text-amber-200 font-medium">Your Cart</span>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-amber-300" />
                <span className="text-amber-100 font-bold">0 items</span>
              </div>
            </div>
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-amber-900 font-bold py-3 rounded-lg transition duration-300">
              View Cart
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile/tablet */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm sm:hidden md:hidden z-50"
        />
      )}
    </header>
  );
};

export default Header;
