/**
 * P03 TaxPilot OpenGraph image — orange accent (#f97316)
 * Signals Indian Business / GST compliance category.
 * Mirrors the visual rhythm of P02 ChatBase OG image.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TaxPilot — AI GST & Invoicing for Indian SMBs (free for the first year, by AddonWeb)";

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
        {/* Orange radial top-right */}
        <div
          style={{
            position:      "absolute",
            top:           -250,
            right:         -250,
            width:         700,
            height:        700,
            borderRadius:  "50%",
            background:    "radial-gradient(circle, rgba(249,115,22,0.30) 0%, rgba(249,115,22,0) 70%)",
          }}
        />
        {/* Yellow radial bottom-left */}
        <div
          style={{
            position:      "absolute",
            bottom:        -250,
            left:          -250,
            width:         700,
            height:        700,
            borderRadius:  "50%",
            background:    "radial-gradient(circle, rgba(234,179,8,0.18) 0%, rgba(234,179,8,0) 70%)",
          }}
        />

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width:           36,
                height:          36,
                borderRadius:    8,
                background:      "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                fontSize:        18,
                fontWeight:      900,
              }}
            >
              ▲
            </div>
            <span style={{ fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: -0.3 }}>
              by AddonWeb
            </span>
          </div>
          <div
            style={{
              padding:      "10px 22px",
              background:   "rgba(249,115,22,0.12)",
              border:       "1px solid rgba(249,115,22,0.4)",
              borderRadius: 999,
              fontSize:     20,
              color:        "#fb923c",
              fontWeight:   600,
              display:      "flex",
              alignItems:   "center",
            }}
          >
            ● Coming Day 30 · Free
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize:       88,
                fontWeight:     900,
                letterSpacing:  -3,
                lineHeight:     1,
                background:     "linear-gradient(135deg, #fb923c 0%, #f97316 60%, #ea580c 100%)",
                backgroundClip: "text",
                color:          "transparent",
                display:        "flex",
              }}
            >
              TaxPilot
            </span>
            <div
              style={{
                fontSize:      46,
                fontWeight:    800,
                letterSpacing: -1.5,
                lineHeight:    1.1,
                marginTop:     16,
                color:         "#fff",
                display:       "flex",
              }}
            >
              GST compliance on autopilot.
            </div>
          </div>
          <div
            style={{
              fontSize:   26,
              color:      "rgba(255,255,255,0.65)",
              maxWidth:   1000,
              lineHeight: 1.4,
              display:    "flex",
            }}
          >
            AI-driven GST invoicing · GSTR-1/3B filing · e-Invoice IRN. For 5–100 employee Indian businesses.
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              padding:      "14px 22px",
              background:   "#1a1a1f",
              border:       "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              fontSize:     20,
              color:        "rgba(255,255,255,0.85)",
              fontWeight:   500,
              display:      "flex",
            }}
          >
            Join the waitlist →
          </div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontWeight: 500, display: "flex" }}>
            addon90days.vercel.app/taxpilot
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
