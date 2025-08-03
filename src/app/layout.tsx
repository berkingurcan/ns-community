
import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/ui/Navigation";
import { OnboardingBanner } from "@/components/ui/OnboardingBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from 'sonner';

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NSphere - Community Hub for Builders",
  description: "Connect with builders, showcase projects, and grow your network in the NSphere community.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={redHatDisplay.variable}>
      <body className="antialiased bg-background text-foreground transition-smooth">
        <ErrorBoundary>
          <AuthProvider>
            <Navigation />
            <OnboardingBanner />
            <main>{children}</main>
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
