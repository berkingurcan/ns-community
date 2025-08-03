
import type { Metadata } from "next";
import { Maven_Pro } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import Wallet from "./providers/wallet-provider";
import { EnhancedAuthProvider } from "@/context/EnhancedAuthContext";
import { Toaster } from "@/components/ui/sonner";

const mavenPro = Maven_Pro({
  variable: "--font-maven-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Project Hub",
  description: "Discover innovative projects and connect with builders in the ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // AGGRESSIVE extension error suppression
              (function() {
                // Override console methods immediately
                const originalMethods = {
                  error: console.error,
                  warn: console.warn,
                  log: console.log
                };
                
                const suppressPattern = (message) => {
                  const msg = (message || '').toString().toLowerCase();
                  return msg.includes('hostname_check') || 
                         msg.includes('content-script') ||
                         msg.includes('fd55cc53') ||
                         msg.includes('background') ||
                         msg.includes('chrome-extension') ||
                         msg.includes('runtime.lasterror') ||
                         msg.includes('receiving end does not exist') ||
                         msg.includes('cannot read properties of null');
                };
                
                console.error = function(...args) {
                  if (args.some(suppressPattern)) return;
                  return originalMethods.error.apply(console, args);
                };
                
                console.warn = function(...args) {
                  if (args.some(suppressPattern)) return;
                  return originalMethods.warn.apply(console, args);
                };
                
                // Aggressive error event suppression
                const errorHandler = function(e) {
                  const filename = e.filename || e.source || '';
                  const message = e.message || e.reason || '';
                  
                  if (suppressPattern(filename) || suppressPattern(message)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                  }
                };
                
                // Add multiple event listeners with capture
                window.addEventListener('error', errorHandler, true);
                window.addEventListener('unhandledrejection', errorHandler, true);
                document.addEventListener('error', errorHandler, true);
                
                // Override window.onerror
                window.onerror = function(message, source, lineno, colno, error) {
                  if (suppressPattern(message) || suppressPattern(source)) {
                    return true; // Suppress
                  }
                  return false; // Let it through
                };
                
                // Notification for user
                console.log('%c🛡️ Extension Error Suppression Active', 'color: green; font-weight: bold;');
                console.log('%cIf you see hostname_check errors, they are harmless browser extension conflicts.', 'color: gray;');
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${mavenPro.variable} antialiased font-sans`}
      >
        <Wallet>
          <EnhancedAuthProvider>
            {children}
            <Toaster />
          </EnhancedAuthProvider>
        </Wallet>
      </body>
    </html>
  );
}
