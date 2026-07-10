import type { Metadata } from "next";
import { Tajawal, Cairo, IBM_Plex_Sans_Arabic, Playfair_Display, Space_Grotesk, IBM_Plex_Mono, Courier_Prime } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import { ToastProvider } from "@/components/ui/toast";

const tajawal = Tajawal({ subsets: ["arabic", "latin"], weight: ["400", "500", "700", "800"], variable: "--font-tajawal", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["400", "600", "700"], variable: "--font-cairo", display: "swap" });
const ibm = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "600", "700"], variable: "--font-ibm", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-playfair", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-grotesk", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-mono", display: "swap" });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier", display: "swap" });

export const metadata: Metadata = {
  title: "Typo AI — حوّل أفكارك إلى كاروسيل",
  description: "منصة عربية لإنشاء كاروسيل Instagram بسهولة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable} ${ibm.variable} ${playfair.variable} ${grotesk.variable} ${mono.variable} ${courier.variable}`}>
      <body className="font-tajawal antialiased">
        <AppProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
