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
    default: "MachineGuard — IoT Predictive Maintenance",
    template: "%s | MachineGuard",
  },
  description:
    "Catch motor failures 2–4 weeks before they happen. Vibration + current + temperature + load sensors stream to ML models that score every machine on the factory floor.",
  keywords: [
    "predictive maintenance",
    "IoT monitoring",
    "motor failure detection",
    "factory automation",
    "industrial IoT",
    "anomaly detection",
    "manufacturing",
  ],
  authors: [{ name: "AddonWeb Solutions" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "MachineGuard",
    title: "MachineGuard — IoT Predictive Maintenance",
    description:
      "Stop unplanned downtime. Indian manufacturers lose ₹50L–5Cr/year to motor failures. MachineGuard predicts them.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MachineGuard",
    description: "Predict motor failures 2–4 weeks before they happen.",
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
