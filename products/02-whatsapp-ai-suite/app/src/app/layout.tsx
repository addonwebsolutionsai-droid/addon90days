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
    default: "ChatBase — WhatsApp AI Business Suite",
    template: "%s | ChatBase",
  },
  description:
    "Indian SMBs handle 200+ WhatsApp messages/day manually. ChatBase handles them automatically — in Hindi, Hinglish, or English.",
  keywords: [
    "WhatsApp AI",
    "WhatsApp Business",
    "AI chatbot",
    "Indian SMB",
    "WhatsApp automation",
    "business automation",
  ],
  authors: [{ name: "AddonWeb Solutions" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "ChatBase",
    title: "ChatBase — WhatsApp AI Business Suite",
    description:
      "Handle 200+ WhatsApp messages/day automatically. AI that speaks Hindi, Hinglish, and English.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatBase",
    description: "Your WhatsApp. Now AI-powered.",
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
