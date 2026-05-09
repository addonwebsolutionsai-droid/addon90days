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
    default: "TaxPilot — AI GST & Invoicing Platform",
    template: "%s | TaxPilot",
  },
  description:
    "Indian SMBs spend 3+ hours every month on GST returns. TaxPilot files GSTR-1, GSTR-3B, and e-Invoices automatically — with full audit trail.",
  keywords: [
    "GST",
    "GSTR-1",
    "GSTR-3B",
    "e-invoice",
    "IRN",
    "Indian SMB",
    "GST automation",
    "GST compliance",
    "AI invoicing",
  ],
  authors: [{ name: "AddonWeb Solutions" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TaxPilot",
    title: "TaxPilot — AI GST & Invoicing Platform",
    description:
      "GST returns, e-invoicing, and reconciliation on autopilot. Built for Indian SMBs and CAs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaxPilot",
    description: "GST compliance on autopilot.",
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
