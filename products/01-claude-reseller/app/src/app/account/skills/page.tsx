"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Search, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

// metadata cannot be exported from "use client" pages — title set in account layout
const FREE_SKILLS = [
  { id: "invoice-generator",  title: "Invoice Generator",     category: "Indian Business", color: "#f97316" },
  { id: "gst-calculator",     title: "GST Calculator",        category: "Indian Business", color: "#f97316" },
  { id: "email-drafter",      title: "Email Drafter",         category: "Developer Tools", color: "#f59e0b" },
  { id: "pr-description",     title: "PR Description Writer", category: "Developer Tools", color: "#f59e0b" },
];

const PACK_SKILLS: Record<string, Array<{ id: string; title: string; category: string; color: string }>> = {
  "iot-developer-pack": [
    { id: "esp32-firmware-scaffold", title: "ESP32 Firmware Scaffold", category: "IoT & Hardware", color: "#06b6d4" },
    { id: "mqtt-iot-setup",          title: "MQTT IoT Setup",          category: "IoT & Hardware", color: "#06b6d4" },
    { id: "coap-iot-protocol",       title: "CoAP IoT Protocol",       category: "IoT & Hardware", color: "#06b6d4" },
    { id: "modbus-rtu-tcp",          title: "Modbus RTU/TCP",          category: "IoT & Hardware", color: "#06b6d4" },
  ],
  "developer-productivity-pack": [
    { id: "sql-query-builder",         title: "SQL Query Builder",         category: "Developer Tools", color: "#f59e0b" },
    { id: "data-schema-designer",      title: "Data Schema Designer",      category: "Developer Tools", color: "#f59e0b" },
    { id: "wireframe-spec-to-code",    title: "Wireframe Spec to Code",    category: "UI/UX Design",    color: "#10b981" },
    { id: "product-roadmap-generator", title: "Product Roadmap Generator", category: "Startup",         color: "#ec4899" },
  ],
  "trading-pack": [
    { id: "stock-screener-ai",       title: "AI Stock Screener",        category: "Trading & Finance", color: "#eab308" },
    { id: "options-strategy-builder", title: "Options Strategy Builder", category: "Trading & Finance", color: "#eab308" },
    { id: "algo-trading-scaffold",   title: "Algo Trading Scaffold",    category: "Trading & Finance", color: "#eab308" },
    { id: "backtesting-framework",   title: "Backtesting Framework",    category: "Trading & Finance", color: "#eab308" },
  ],
};

export default function MySkillsPage() {
  const { user } = useUser();
  const [query, setQuery] = useState("");

  const purchasedPacks =
    (user?.publicMetadata?.["purchasedPacks"] as string[] | undefined) ?? [];

  const accessibleSkills = [
    ...FREE_SKILLS,
    ...purchasedPacks.flatMap((pack) => PACK_SKILLS[pack] ?? []),
  ];

  const filtered = query
    ? accessibleSkills.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase())
      )
    : accessibleSkills;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">My Skills</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {accessibleSkills.length} skills accessible · {FREE_SKILLS.length} free + {accessibleSkills.length - FREE_SKILLS.length} paid
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={14}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your skills..."
          aria-label="Search skills"
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Skills list */}
      <div
        className="rounded-xl border divide-y"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
      >
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No skills match your search.
          </div>
        ) : (
          filtered.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between px-5 py-3"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: skill.color }}
                />
                <div>
                  <div className="text-sm font-medium">{skill.title}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {skill.category}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: FREE_SKILLS.some((f) => f.id === skill.id)
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(139,92,246,0.12)",
                    color: FREE_SKILLS.some((f) => f.id === skill.id)
                      ? "#22c55e"
                      : "#a78bfa",
                  }}
                >
                  {FREE_SKILLS.some((f) => f.id === skill.id) ? "Free" : "Paid"}
                </span>
                <Link
                  href={`/skills/${skill.id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  Open <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Unlock more CTA */}
      <div className="mt-8 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 to-transparent p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Lock size={16} className="text-violet-400 shrink-0" />
          <div>
            <div className="text-sm font-medium mb-0.5">Unlock all 130+ skills</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              All-Access · ₹2,407/mo
            </div>
          </div>
        </div>
        <Link
          href="/account/billing"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
