import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Claude Toolkit — Skills, MCP Servers & Agent Packs",
    template: "%s | Claude Toolkit",
  },
  description:
    "Production-ready Claude skills, MCP servers, and agent bundles. Built by practitioners. 1-line install. Ships in minutes.",
  keywords: [
    "Claude",
    "Claude Code",
    "MCP server",
    "AI skills",
    "Claude skills",
    "AI toolkit",
    "developer tools",
  ],
  authors: [{ name: "AddonWeb Solutions" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Claude Toolkit",
    title: "Claude Toolkit — Skills, MCP Servers & Agent Packs",
    description:
      "Production-ready Claude skills and MCP servers. Built by practitioners who run a 13-agent AI company.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Toolkit",
    description: "Production-ready Claude skills. 1-line install.",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      >
        <body
          className="font-sans bg-bg-base text-white min-h-screen"
          suppressHydrationWarning
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

export default RootLayout;
