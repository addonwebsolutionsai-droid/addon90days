"use client";

import Link from "next/link";
import { Infinity as InfinityIcon } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

export function Nav() {
  const { isSignedIn } = useUser();

  return (
    <nav
      className="sticky top-0 z-50 glass-panel"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: brand */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="SKILON home"
        >
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <InfinityIcon size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span
            className="font-semibold text-sm tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            SKILON
          </span>
          <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded font-mono hidden sm:inline">
            v1.0
          </span>
        </Link>

        {/* Center: links (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-6">
          {(
            [
              { href: "/skills",  label: "Skills",  external: false },
              { href: "/account", label: "Account", external: false },
            ] as const
          ).map(({ href, label, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: theme toggle + auth */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex items-center h-9 px-4 text-sm rounded-lg transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center h-9 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
