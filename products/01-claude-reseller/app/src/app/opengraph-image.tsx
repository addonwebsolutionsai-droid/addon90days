/**
 * Default OpenGraph image for the homepage.
 *
 * Renders dynamically at https://addon90days.vercel.app/opengraph-image.
 * 1200x630 — the standard OG card size shared by Twitter, LinkedIn, Slack,
 * Discord, and most rich-link unfurlers.
 *
 * Design: dark base (#0a0a0c) with violet→pink radial gradient and
 * geometric grid backdrop. Bold serif-ish title using system font stack
 * because @vercel/og's font fetching adds latency we don't need on the
 * default share card.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AddonWeb Claude Toolkit — 130 production-ready Claude skills, free during beta";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width:           "100%",
          height:          "100%",
          background:      "#0a0a0c",
          display:         "flex",
          flexDirection:   "column",
          justifyContent:  "space-between",
          padding:         "72px 80px",
          position:        "relative",
          color:           "#fff",
          fontFamily:      "Inter, system-ui, sans-serif",
        }}
      >
        {/* Subtle radial gradient accent — top-right */}
        <div
          style={{
            position:        "absolute",
            top:             -200,
            right:           -200,
            width:           600,
            height:          600,
            borderRadius:    "50%",
            background:      "radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0) 70%)",
          }}
        />
        {/* Pink accent — bottom-left */}
        <div
          style={{
            position:        "absolute",
            bottom:          -200,
            left:            -200,
            width:           600,
            height:          600,
            borderRadius:    "50%",
            background:      "radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(236,72,153,0) 70%)",
          }}
        />

        {/* Top row: brand + free badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width:           48,
                height:          48,
                borderRadius:    12,
                background:      "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                fontSize:        24,
                fontWeight:      900,
              }}
            >
              ▲
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
              AddonWeb Claude Toolkit
            </span>
          </div>
          <div
            style={{
              padding:         "10px 18px",
              background:      "rgba(34,197,94,0.12)",
              border:          "1px solid rgba(34,197,94,0.4)",
              borderRadius:    999,
              fontSize:        20,
              color:           "#4ade80",
              fontWeight:      600,
              display:         "flex",
              alignItems:      "center",
            }}
          >
            ● Free during beta
          </div>
        </div>

        {/* Center: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize:        82,
              fontWeight:      900,
              letterSpacing:   -2,
              lineHeight:      1.05,
              maxWidth:        1000,
              display:         "flex",
              flexDirection:   "column",
            }}
          >
            <span>130 production-ready</span>
            <span
              style={{
                background:               "linear-gradient(90deg, #c4b5fd 0%, #f9a8d4 100%)",
                backgroundClip:           "text",
                color:                    "transparent",
              }}
            >
              Claude skills.
            </span>
          </div>
          <div
            style={{
              fontSize:    28,
              color:       "rgba(255,255,255,0.65)",
              maxWidth:    900,
              lineHeight:  1.4,
            }}
          >
            Slash commands for Claude Code. MCP server for Claude Desktop. Try Live in your browser — no install needed.
          </div>
        </div>

        {/* Bottom row: install command + URL */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              padding:         "16px 24px",
              background:      "#1a1a1f",
              border:          "1px solid rgba(255,255,255,0.08)",
              borderRadius:    12,
              fontFamily:      "ui-monospace, SFMono-Regular, monospace",
              fontSize:        20,
              color:           "#a78bfa",
              display:         "flex",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)" }}>$&nbsp;</span>
            npx addonweb-claude-skills install &lt;skill&gt;
          </div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", fontWeight: 500, display: "flex" }}>
            addon90days.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
