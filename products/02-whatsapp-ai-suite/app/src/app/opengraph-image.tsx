/**
 * P02 ChatBase OpenGraph image — distinct accent (green WhatsApp-coded)
 * to signal it's a separate product from the Claude Toolkit catalog.
 */

import { ImageResponse } from "next/og";
import { SITE_DOMAIN } from "@/lib/site-config";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ChatBase — WhatsApp AI for Indian SMBs (free for the first year, by AddonWeb)";

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
        <div
          style={{
            position:        "absolute",
            top:             -250,
            right:           -250,
            width:           700,
            height:          700,
            borderRadius:    "50%",
            background:      "radial-gradient(circle, rgba(34,197,94,0.30) 0%, rgba(34,197,94,0) 70%)",
          }}
        />
        <div
          style={{
            position:        "absolute",
            bottom:          -250,
            left:            -250,
            width:           700,
            height:          700,
            borderRadius:    "50%",
            background:      "radial-gradient(circle, rgba(139,92,246,0.20) 0%, rgba(139,92,246,0) 70%)",
          }}
        />

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
              padding:         "10px 22px",
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
            ● Coming Day 30 · Free
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize:        88,
                fontWeight:      900,
                letterSpacing:   -3,
                lineHeight:      1,
                background:      "linear-gradient(135deg, #4ade80 0%, #22c55e 60%, #16a34a 100%)",
                backgroundClip:  "text",
                color:           "transparent",
                display:         "flex",
              }}
            >
              ChatBase
            </span>
            <div
              style={{
                fontSize:        46,
                fontWeight:      800,
                letterSpacing:   -1.5,
                lineHeight:      1.1,
                marginTop:       16,
                color:           "#fff",
                display:         "flex",
              }}
            >
              WhatsApp AI for Indian SMBs.
            </div>
          </div>
          <div
            style={{
              fontSize:    26,
              color:       "rgba(255,255,255,0.65)",
              maxWidth:    1000,
              lineHeight:  1.4,
              display:     "flex",
            }}
          >
            AI customer service · lead capture · appointment booking. For 5–50 employee shops, restaurants, salons, clinics.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              padding:         "14px 22px",
              background:      "#1a1a1f",
              border:          "1px solid rgba(255,255,255,0.08)",
              borderRadius:    10,
              fontSize:        20,
              color:           "rgba(255,255,255,0.85)",
              fontWeight:      500,
              display:         "flex",
            }}
          >
            Join the waitlist →
          </div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontWeight: 500, display: "flex" }}>
            {SITE_DOMAIN}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
