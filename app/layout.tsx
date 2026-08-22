import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "K-Coffee",
  description: "K-coffee shop website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <SidebarProvider>{children}</SidebarProvider>

        <Analytics />
        <Toaster expand={true} richColors />
      </body>
    </html>
  );
}
