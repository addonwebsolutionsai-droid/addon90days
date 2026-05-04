import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { ConditionalSidebar } from "@/components/conditional-sidebar";
import { MobileSpacer } from "@/components/mobile-spacer";
import { ConditionalChatWidget } from "@/components/conditional-chat-widget";
import { PostHogProvider } from "@/components/posthog-provider";
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

// Next.js App Router requires the root layout to be a default export.
// Named exports are used everywhere else; this is the one justified exception.
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable}`}
      >
        <body className="font-sans min-h-screen" suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* Analytics tracker — no-op when NEXT_PUBLIC_POSTHOG_KEY is unset */}
            <Suspense fallback={null}>
              <PostHogProvider />
            </Suspense>
            {/*
             * Sidebar layout:
             * - ConditionalSidebar renders the 220px fixed sidebar on marketplace
             *   pages (/,/skills) and hides itself on /account, /sign-in, /sign-up.
             * - The flex wrapper + mobile spacer are always present so the layout
             *   is consistent, but on account pages the sidebar is absent and
             *   account/layout.tsx provides its own full-page flex layout.
             */}
            <div className="flex min-h-screen">
              <Suspense fallback={null}>
                <ConditionalSidebar />
              </Suspense>
              <div className="flex-1 min-w-0 flex flex-col">
                {/* Mobile top bar spacer — hidden on account/auth pages */}
                <Suspense fallback={null}>
                  <MobileSpacer />
                </Suspense>
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </div>
            {/* Floating support bot — toolkit pages only.
                Per-product brand pages render no widget so the toolkit's
                bot doesn't answer questions on /chatbase, /taxpilot, etc. */}
            <Suspense fallback={null}>
              <ConditionalChatWidget />
            </Suspense>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
