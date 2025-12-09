import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const Header = () => {
  return (
    <div>
      <nav className="bg-transparent text-slate-50 text-xl sm:px-28 p-7 justify-end gap-4 hidden sm:flex">
        <Link
          className="hover:text-amber-300 hover:underline transition delay-100 duration-300 ease-in-out hover:-translate-y-1 :scale-100 hover:font-bold"
          href="/"
        >
          Home
        </Link>
        <Link
          className="hover:text-amber-300 hover:underline transition duration-300 ease-in-out hover:-translate-y-1 :scale-100 hover:font-bold"
          href="/menu"
        >
          Menu
        </Link>
        <Link
          className="hover:text-amber-300 hover:underline transition duration-300 ease-in-out hover:-translate-y-1 :scale-100 hover:font-bold"
          href="/about"
        >
          About Us
        </Link>
        <Link
          className="hover:text-amber-300 hover:underline transition duration-300 ease-in-out hover:-translate-y-1 :scale-100 hover:font-bold"
          href="/Locations"
        >
          Locations
        </Link>
        <Link
          className="hover:text-amber-300 hover:underline transition duration-300 ease-in-out hover:-translate-y-1 :scale-100 hover:font-bold"
          href="Contact"
        >
          Contact
        </Link>
        <ShoppingCart className="hover:text-amber-300 transition duration-300 ease-in-out hover:-translate-y-1 :scale-100 hover:font-bold" />
      </nav>
    </div>
  );
};

export default Header;
