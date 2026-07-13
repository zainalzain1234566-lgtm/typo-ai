import type { Metadata } from "next";
import {
  Cairo,
  Courier_Prime,
  IBM_Plex_Mono,
  IBM_Plex_Sans_Arabic,
  Playfair_Display,
  Space_Grotesk,
  Tajawal,
} from "next/font/google";
import { getSiteUrl, ROUTE_SEO } from "@/lib/seo";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
  preload: true,
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
  preload: false,
});
const ibm = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-ibm",
  display: "swap",
  preload: false,
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-grotesk",
  display: "swap",
  preload: false,
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});
const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: ROUTE_SEO["/"].title,
  description: ROUTE_SEO["/"].description,
  openGraph: {
    title: ROUTE_SEO["/"].title,
    description: ROUTE_SEO["/"].description,
    siteName: "Typo AI",
    locale: "ar_IQ",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: ROUTE_SEO["/"].title }],
  },
  twitter: {
    card: "summary_large_image",
    title: ROUTE_SEO["/"].title,
    description: ROUTE_SEO["/"].description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${cairo.variable} ${ibm.variable} ${playfair.variable} ${grotesk.variable} ${mono.variable} ${courier.variable}`}
    >
      <body className="font-tajawal antialiased">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-lg bg-white px-4 py-3 font-bold text-ink shadow-lg focus:not-sr-only focus:fixed focus:right-4 focus:top-4"
        >
          تخطي إلى المحتوى الرئيسي
        </a>
        {children}
      </body>
    </html>
  );
}
