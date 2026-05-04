/**
 * ChatBase dashboard layout.
 *
 * Isolates ChatBase brand from the Claude Toolkit shell.
 * No shared sidebar — ChatBase has its own header.
 * Clerk auth is inherited from the root layout's ClerkProvider.
 */

import type { ReactNode } from "react";

export const metadata = {
  title: "ChatBase — Dashboard",
  description: "WhatsApp AI Business Suite",
};

export default function ChatbaseDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Per-product top bar — ChatBase brand, not Claude Toolkit */}
      <header
        className="sticky top-0 z-40 border-b flex items-center gap-3 px-5 h-12"
        style={{
          backgroundColor: "var(--bg-base)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Logo mark */}
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)" }}
          aria-hidden="true"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
          >
            {/* WhatsApp-inspired message bubble */}
            <path
              d="M6.5 1C3.46 1 1 3.24 1 6c0 .97.28 1.87.76 2.63L1 12l3.48-.75A5.54 5.54 0 0 0 6.5 11C9.54 11 12 8.76 12 6S9.54 1 6.5 1Z"
              fill="white"
              fillOpacity="0.9"
            />
          </svg>
        </div>

        <span className="font-semibold text-sm tracking-tight" style={{ color: "#22c55e" }}>
          ChatBase
        </span>

        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "var(--bg-s2)", color: "var(--text-muted)" }}
        >
          beta
        </span>

        <span
          className="hidden sm:block text-xs ml-1"
          style={{ color: "var(--text-muted)" }}
        >
          WhatsApp AI Business Suite
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mock mode indicator — always visible in beta */}
        <div
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
          style={{
            borderColor: "rgba(6,182,212,0.3)",
            backgroundColor: "rgba(6,182,212,0.06)",
            color: "#06b6d4",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "#06b6d4" }}
            aria-hidden="true"
          />
          Mock mode
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
