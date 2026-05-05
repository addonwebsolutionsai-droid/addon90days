/**
 * P05 ConnectOne OpenGraph image -- cyan (#06b6d4) accent, IoT industrial tone.
 * 1200x630, edge runtime, mirrors the ChatBase OG pattern.
 */

import { ImageResponse } from "next/og";
import { SITE_DOMAIN } from "@/lib/site-config";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ConnectOne -- IoT Plug-and-Play Platform for Industrial SMBs (by AddonWeb)";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          "100%",
          height:         "100%",
          background:     "#0a0a0c",
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "space-between",
          padding:        "72px 80px",
          position:       "relative",
          color:          "#fff",
          fontFamily:     "Inter, system-ui, sans-serif",
        }}
      >
        {/* Cyan radial top-right */}
        <div
          style={{
            position:     "absolute",
            top:          -250,
            right:        -250,
            width:        700,
            height:       700,
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(6,182,212,0.28) 0%, rgba(6,182,212,0) 70%)",
          }}
        />
        {/* Purple radial bottom-left */}
        <div
          style={{
            position:     "absolute",
            bottom:       -250,
            left:         -250,
            width:        700,
            height:       700,
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0) 70%)",
          }}
        />

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width:          36,
                height:         36,
                borderRadius:   8,
                background:     "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       18,
                fontWeight:     900,
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
              padding:        "10px 22px",
              background:     "rgba(6,182,212,0.12)",
              border:         "1px solid rgba(6,182,212,0.4)",
              borderRadius:   999,
              fontSize:       20,
              color:          "#22d3ee",
              fontWeight:     600,
              display:        "flex",
              alignItems:     "center",
            }}
          >
            ● Pilots Opening Day 60
          </div>
        </div>

        {/* Main copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize:       88,
                fontWeight:     900,
                letterSpacing:  -3,
                lineHeight:     1,
                background:     "linear-gradient(135deg, #22d3ee 0%, #06b6d4 60%, #0891b2 100%)",
                backgroundClip: "text",
                color:          "transparent",
                display:        "flex",
              }}
            >
              ConnectOne
            </span>
            <div
              style={{
                fontSize:     46,
                fontWeight:   800,
                letterSpacing:-1.5,
                lineHeight:   1.1,
                marginTop:    16,
                color:        "#fff",
                display:      "flex",
              }}
            >
              IoT plug-and-play. No firmware engineer.
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
            ESP32 + Modbus gateway ships pre-flashed. Plug in, connect to Wi-Fi, see live sensor data in under 4 hours.
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              padding:        "14px 22px",
              background:     "#1a1a1f",
              border:         "1px solid rgba(255,255,255,0.08)",
              borderRadius:   10,
              fontSize:       20,
              color:          "rgba(255,255,255,0.85)",
              fontWeight:     500,
              display:        "flex",
            }}
          >
            Register for pilot program →
          </div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontWeight: 500, display: "flex" }}>
            {SITE_DOMAIN}/connectone
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
