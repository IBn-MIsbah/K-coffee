import Footer from "@/components/Home/componenets/Footer";
import Header from "@/components/Home/componenets/Header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <div className="bg-amber-950 pt-12 sm:pt-16 shrink-0 mt-auto">
        <Footer />
      </div>
    </div>
  );
}
