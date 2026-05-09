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
    default: "ConnectOne — IoT Plug-and-Play Platform",
    template: "%s | ConnectOne",
  },
  description:
    "Device connectivity, multi-tenant fleet management, white-label mobile apps, and admin consoles — all working on day one. Skip 6-18 months of IoT backend engineering.",
  keywords: [
    "IoT platform",
    "MQTT broker",
    "device provisioning",
    "fleet management",
    "white-label IoT",
    "EMQX",
    "industrial IoT",
  ],
  authors: [{ name: "AddonWeb Solutions" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ConnectOne",
    title: "ConnectOne — IoT Plug-and-Play Platform",
    description:
      "Working IoT backend + white-label mobile + admin console in days, not months.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectOne",
    description: "IoT plug-and-play platform — for device makers who'd rather ship products than build backends.",
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
