import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/sonner";
import ErrorDiagnosticsModal from "@/components/shared/ErrorDiagnosticsModal";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Hyperlocal Platform",
  description: "Find the best local vendors near you.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hyperlocal",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground pb-16`}>
        <AuthGuard>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthGuard>
        <Toaster position="top-center" />
        <ErrorDiagnosticsModal />
      </body>
    </html>
  );
}
