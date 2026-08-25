import Header from "@/components/Home/componenets/Header";

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header />
      {children}
    </div>
  );
}
