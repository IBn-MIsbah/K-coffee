import { CheckCircle, Coffee } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          {/* Left side - Brand/Content */}
          <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-amber-600 to-amber-700 p-12">
            <div className="flex flex-col justify-center max-w-md mx-auto text-white">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Coffee className="h-8 w-8" />
                  </div>
                  <h1 className="text-3xl font-bold">K-Coffee Shop</h1>
                </div>
                <p className="text-amber-100 text-lg">
                  Join our community of coffee lovers. Sign in to explore our
                  premium blends and exclusive offers.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <span>Premium coffee blends</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <span>Exclusive member discounts</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <span>Track your orders</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
