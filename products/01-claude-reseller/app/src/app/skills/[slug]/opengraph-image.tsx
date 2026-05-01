/**
 * Per-skill OpenGraph image — every /skills/[slug] gets its own dynamic
 * 1200x630 share card with the skill's title + tagline + category accent.
 *
 * This is the polish that makes shared links look like a real product
 * instead of a hobby project. Every slack/twitter/discord paste of a
 * skill URL renders a custom card.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AddonWeb Claude Toolkit skill";

const CATEGORY_ACCENT: Record<string, { color: string; emoji: string; label: string }> = {
  "ai-llm":                  { color: "#8b5cf6", emoji: "🤖", label: "AI & LLM" },
  "iot":                     { color: "#06b6d4", emoji: "📡", label: "IoT & Hardware" },
  "developer-tools":         { color: "#f59e0b", emoji: "⚡", label: "Developer Tools" },
  "startup-product":         { color: "#ec4899", emoji: "🚀", label: "Startup & Product" },
  "ui-ux":                   { color: "#10b981", emoji: "🎨", label: "UI/UX Design" },
  "indian-business":         { color: "#f97316", emoji: "🇮🇳", label: "Indian Business" },
  "data-analytics":          { color: "#3b82f6", emoji: "📊", label: "Data & Analytics" },
  "devops-infra":            { color: "#6366f1", emoji: "🛠", label: "DevOps & Infra" },
  "communication-protocols": { color: "#14b8a6", emoji: "🔗", label: "Protocols" },
  "marketing-growth":        { color: "#f43f5e", emoji: "📈", label: "Marketing & Growth" },
  "trading-finance":         { color: "#eab308", emoji: "📉", label: "Trading & Finance" },
};

interface SkillForOg {
  title:    string;
  tagline:  string;
  category: string;
  slug:     string;
}

async function fetchSkill(slug: string): Promise<SkillForOg | null> {
  try {
    const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://addon90days.vercel.app";
    const res = await fetch(`${baseUrl}/api/skills/${slug}`, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const skill = await res.json() as { title: string; tagline: string; category: string; slug: string };
    return { title: skill.title, tagline: skill.tagline, category: skill.category, slug: skill.slug };
  } catch {
    return null;
  }
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill    = await fetchSkill(slug);
  const accent   = skill ? (CATEGORY_ACCENT[skill.category] ?? CATEGORY_ACCENT["ai-llm"]!) : CATEGORY_ACCENT["ai-llm"]!;
  const title    = skill?.title   ?? slug;
  const tagline  = skill?.tagline ?? "A production-ready Claude skill from AddonWeb Claude Toolkit.";

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
        {/* Category-tinted gradient accent */}
        <div
          style={{
            position:        "absolute",
            top:             -250,
            right:           -250,
            width:           700,
            height:          700,
            borderRadius:    "50%",
            background:      `radial-gradient(circle, ${accent.color}40 0%, ${accent.color}00 70%)`,
          }}
        />

        {/* Top: parent brand + category pill */}
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
            <span style={{ fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: -0.3 }}>
              AddonWeb Claude Toolkit
            </span>
          </div>
          <div
            style={{
              padding:         "8px 18px",
              background:      `${accent.color}1a`,
              border:          `1px solid ${accent.color}66`,
              borderRadius:    999,
              fontSize:        18,
              color:           accent.color,
              fontWeight:      600,
              display:         "flex",
              alignItems:      "center",
              gap:             8,
            }}
          >
            <span>{accent.emoji}</span>
            <span>{accent.label}</span>
          </div>
        </div>

        {/* Skill title + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize:        title.length > 30 ? 64 : 78,
              fontWeight:      900,
              letterSpacing:   -2,
              lineHeight:      1.05,
              maxWidth:        1040,
              display:         "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize:    28,
              color:       "rgba(255,255,255,0.65)",
              maxWidth:    1000,
              lineHeight:  1.4,
              display:     "flex",
            }}
          >
            {tagline.length > 200 ? tagline.slice(0, 197) + "…" : tagline}
          </div>
        </div>

        {/* Bottom: try-live CTA + run command */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              padding:         "12px 22px",
              background:      "#1a1a1f",
              border:          "1px solid rgba(255,255,255,0.08)",
              borderRadius:    10,
              fontFamily:      "ui-monospace, SFMono-Regular, monospace",
              fontSize:        18,
              color:           "#a78bfa",
              display:         "flex",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)" }}>$&nbsp;</span>
            npx addonweb-claude-skills install {slug}
          </div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontWeight: 500, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", color: "white", padding: "4px 10px", borderRadius: 6, fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>
              TRY LIVE
            </span>
            <span>addon90days.vercel.app/skills/{slug}</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
