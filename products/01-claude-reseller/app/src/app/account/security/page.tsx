"use client";

/**
 * Security page — uses Clerk's hosted <UserProfile /> component.
 *
 * Why Clerk-hosted instead of homegrown: password change, 2FA setup,
 * active session listing + revocation, email verification, social
 * account linking — Clerk already implements all of these correctly.
 * Reimplementing them was busywork that left fake "Web browser /
 * Mobile device" placeholder rows in the previous version.
 *
 * <UserProfile /> auto-themes against the surrounding ThemeProvider
 * via Clerk's "appearance" prop (we use the dark variables from
 * --bg-base, --text-primary, etc).
 */

import { UserProfile } from "@clerk/nextjs";

export default function SecurityPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Security</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Password, two-factor authentication, active sessions, and connected accounts.
          Powered by Clerk — every change here applies in real time.
        </p>
      </div>

      <UserProfile
        routing="hash"
        appearance={{
          variables: {
            colorPrimary:         "#8b5cf6",
            colorBackground:      "#0f0f14",
            colorText:            "#f5f5f7",
            colorTextSecondary:   "#a8a8b3",
            colorInputBackground: "#1a1a22",
            colorInputText:       "#f5f5f7",
            colorDanger:          "#ef4444",
            borderRadius:         "0.75rem",
          },
          elements: {
            rootBox: { width: "100%" },
            card: {
              boxShadow:       "none",
              border:          "1px solid rgba(255,255,255,0.06)",
              backgroundColor: "#15151c",
            },
          },
        }}
      />
    </div>
  );
}
