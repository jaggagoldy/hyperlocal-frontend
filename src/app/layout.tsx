import { Suspense } from 'react';
import PwaManifestInjector from '@/components/PwaManifestInjector';
import PwaUpdatePrompt from '@/components/PwaUpdatePrompt';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/sonner";
import ErrorDiagnosticsModal from "@/components/shared/ErrorDiagnosticsModal";
import DbModeBadge from "@/components/shared/DbModeBadge";
import { TutorialModal } from '@/components/shared/TutorialModal';
import { SpotlightTour } from '@/components/shared/SpotlightTour';
import GoogleAuthProvider from '@/components/providers/GoogleAuthProvider';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "NearByBazar",
  description: "Find the best local vendors near you.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NearByBazar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <PwaManifestInjector />
        </Suspense>
        <GoogleAuthProvider>
          <AuthGuard>
            <TutorialModal />
            <SpotlightTour />
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <BottomNav />
            <Footer />
          </AuthGuard>
          <Toaster position="top-center" />
          <PwaUpdatePrompt />
          <ErrorDiagnosticsModal />
          <DbModeBadge />
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
