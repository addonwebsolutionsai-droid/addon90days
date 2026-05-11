/**
 * P04 TableFlow OpenGraph image — pink accent (#ec4899)
 * Signals restaurant / food-tech startup category.
 * Mirrors the visual rhythm of P02 ChatBase OG image.
 */

import { ImageResponse } from "next/og";
import { SITE_DOMAIN } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TableFlow — WhatsApp-native Restaurant OS (free for the first year, by AddonWeb)";

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
        {/* Pink radial top-right */}
        <div
          style={{
            position:      "absolute",
            top:           -250,
            right:         -250,
            width:         700,
            height:        700,
            borderRadius:  "50%",
            background:    "radial-gradient(circle, rgba(236,72,153,0.28) 0%, rgba(236,72,153,0) 70%)",
          }}
        />
        {/* Purple radial bottom-left */}
        <div
          style={{
            position:      "absolute",
            bottom:        -250,
            left:          -250,
            width:         700,
            height:        700,
            borderRadius:  "50%",
            background:    "radial-gradient(circle, rgba(168,85,247,0.20) 0%, rgba(168,85,247,0) 70%)",
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
              background:   "rgba(236,72,153,0.12)",
              border:       "1px solid rgba(236,72,153,0.4)",
              borderRadius: 999,
              fontSize:     20,
              color:        "#f472b6",
              fontWeight:   600,
              display:      "flex",
              alignItems:   "center",
            }}
          >
            ● Coming Day 45 · Free
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
                background:     "linear-gradient(135deg, #f472b6 0%, #ec4899 60%, #db2777 100%)",
                backgroundClip: "text",
                color:          "transparent",
                display:        "flex",
              }}
            >
              TableFlow
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
              Restaurant OS on WhatsApp.
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
            WhatsApp ordering · QR table menus · loyalty cashback · daily reports. For 1–20 outlet restaurants, cafes, cloud kitchens.
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
            {SITE_DOMAIN}/tableflow
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
