import Footer from "@/components/Home/componenets/Footer";
import Header from "@/components/Home/componenets/Header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <div className="bg-amber-950 pt-12 sm:pt-16">
        <Footer />
      </div>
    </>
  );
}
