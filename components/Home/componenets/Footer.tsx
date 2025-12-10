import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const date = new Date();
  const year = date.getFullYear();

  // Styling for internal links (formerly FooterLink component)
  const linkClasses =
    "text-sm text-amber-200 hover:text-amber-400 transition-colors duration-200";

  return (
    // Base styling for the footer container
    <footer className="bg-amber-950 px-6 py-10 md:py-16">
      <div className="container mx-auto max-w-7xl">
        {/* --- Main Content Grid: Stacks on small, 3 columns on medium+ --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mb-12">
          {/* 1. Brand & Tagline (Always full width on mobile, left-aligned on desktop) */}
          <div className="text-center md:text-left">
            <div className="inline-flex md:flex items-center gap-3 mb-2 justify-center md:justify-start">
              <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-amber-950 font-extrabold text-xl font-serif">
                  K
                </span>
              </div>
              <span className="text-2xl font-bold text-amber-50 font-serif">
                K-COFFEE
              </span>
            </div>
            <p className="text-amber-200 text-sm mt-4 max-w-xs mx-auto md:mx-0">
              Crafting exceptional coffee experiences, one cup at a time.
            </p>
          </div>

          {/* 2. Quick Links (Hidden on small, appears on medium+) */}
          <div className="hidden md:block">
            <h3 className="text-xl font-bold text-amber-50 mb-6 tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/menu" className={linkClasses}>
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/locations" className={linkClasses}>
                  Locations
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClasses}>
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/careers" className={linkClasses}>
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Contact Information (Aligned to the right on desktop, center on mobile) */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold text-amber-50 mb-6 tracking-wider">
              Get In Touch
            </h3>
            <div className="space-y-4">
              {/* Phone */}
              <div className="flex items-center gap-3 justify-center md:justify-end">
                <Phone className="w-5 h-5 text-amber-400" />
                <a
                  href="tel:+251987654321"
                  className="text-amber-100 text-base hover:text-amber-300 transition-colors"
                >
                  +251 987 654 321
                </a>
              </div>

              {/* Mail */}
              <div className="flex items-center gap-3 justify-center md:justify-end">
                <Mail className="w-5 h-5 text-amber-400" />
                <a
                  href="mailto:info@k-coffee.com"
                  className="text-amber-100 text-base hover:text-amber-300 transition-colors"
                >
                  info@k-coffee.com
                </a>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 justify-center md:justify-end">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span className="text-amber-100 text-base">
                  123 Coffee Street, City Center
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Divider --- */}
        <div className="border-t border-amber-800/50 my-8"></div>

        {/* --- Social Links and Copyright --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left space-y-4 sm:space-y-0">
          {/* Social Links */}
          <div className="flex justify-center gap-4 order-2 sm:order-1">
            <a href="#">
              <Facebook className="w-7 h-7 p-1 rounded-full bg-amber-800 text-amber-100 hover:bg-amber-700 cursor-pointer transition-colors" />
            </a>
            <a href="#">
              <Instagram className="w-7 h-7 p-1 rounded-full bg-amber-800 text-amber-100 hover:bg-amber-700 cursor-pointer transition-colors" />
            </a>
            <a href="#">
              <Twitter className="w-7 h-7 p-1 rounded-full bg-amber-800 text-amber-100 hover:bg-amber-700 cursor-pointer transition-colors" />
            </a>
          </div>

          {/* Copyright & Policy Links */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs order-1 sm:order-2">
            <p className="text-amber-200">
              &copy; {year} K-Coffee. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/privacy" className={linkClasses}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={linkClasses}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
