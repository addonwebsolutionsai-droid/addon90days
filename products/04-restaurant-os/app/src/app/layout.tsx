import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TableFlow — Smart Restaurant OS",
    template: "%s | TableFlow",
  },
  description:
    "QR menu ordering + Kitchen Display + Owner Dashboard. Restaurants in Indian Tier 1+2 cities replacing paper menus and manual order-taking with one tablet system.",
  keywords: [
    "restaurant POS",
    "QR menu",
    "kitchen display system",
    "KDS",
    "table ordering",
    "restaurant analytics",
    "Indian restaurant tech",
  ],
  authors: [{ name: "AddonWeb Solutions" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TableFlow",
    title: "TableFlow — Smart Restaurant OS",
    description:
      "QR menu + Kitchen Display + Owner Dashboard for Indian restaurants.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TableFlow",
    description: "QR menu ordering for Indian restaurants. ₹999/mo.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`dark ${inter.variable}`}>
        <body className="font-sans min-h-screen" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
