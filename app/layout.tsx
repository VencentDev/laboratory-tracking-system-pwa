import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegistration } from "@/core/pwa/register-sw";
import { ThemeProvider } from "@/core/providers/theme-provider";
import { SonnerToaster } from "@/core/ui/sonner";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Laboratory Tracking System",
  description: "Track laboratory inventory, borrowing activity, and borrower records in one workspace.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lab Tracking",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} font-sans`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <TooltipProvider delayDuration={0}>
            <ServiceWorkerRegistration />
            {children}
            <SonnerToaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
