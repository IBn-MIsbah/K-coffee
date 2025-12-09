import { Facebook, Globe, Instagram, Phone } from "lucide-react";

const Footer = () => {
  const date = new Date();
  const year = date.getFullYear();
  return (
    <div className="flex flex-col sm:flex-row justify-between px-6 sm:px-12 md:px-20 text-amber-100 gap-8 sm:gap-0">
      <div className="flex flex-col gap-2 order-2 sm:order-1">
        <span className="text-xl font-semibold border-b border-amber-500/50 pb-1 mb-2">
          Contact Info
        </span>
        <div className="flex items-center gap-2 text-base hover:text-amber-300 transition-colors">
          <Phone className="w-5 h-5" /> <span>+251987654321</span>{" "}
        </div>
        <div className="flex items-center gap-2 text-base hover:text-amber-300 transition-colors">
          <Globe className="w-5 h-5" /> <span>www.k-coffee.vercel.app</span>
        </div>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-6 order-1 sm:order-2">
        <div className="flex gap-4">
          <Facebook className="w-8 h-8 rounded-lg bg-amber-100 text-amber-950 cursor-pointer hover:bg-amber-300 transition-colors" />
          <Instagram className="w-8 h-8 rounded-lg bg-amber-100 text-amber-950 cursor-pointer hover:bg-amber-300 transition-colors" />
        </div>
        <div>&copy; {year} K-Coffee. All rights are reserved.</div>
      </div>
    </div>
  );
};

export default Footer;
