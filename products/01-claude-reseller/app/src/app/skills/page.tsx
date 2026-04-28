"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { SkillCard } from "@/components/skill-card";
import type { SkillCardProps } from "@/components/skill-card";
import { Button } from "@/components/ui/button";
import { BuyButton } from "@/components/buy-button";
import { cn } from "@/lib/utils";

// --- Skills registry (mirrors packages/toolkit/src/registry.ts) -------------
// This is the hardcoded display copy. The authoritative data lives in the
// toolkit package. When skills are fetched from an API, replace this array
// with a React Query call to /api/skills.

const ALL_SKILLS: SkillCardProps[] = [
  {
    id: "invoice-generator",
    name: "Invoice Generator",
    description:
      "Generate GST-compliant invoices from plain English. Supports CGST/SGST/IGST, HSN codes, and PDF-ready HTML output. Integrates with your existing billing workflow.",
    category: "finance",
    priceUsd: 19,
    tags: ["gst", "invoice", "pdf", "india"],
    featured: true,
  },
  {
    id: "gst-calculator",
    name: "GST Calculator",
    description:
      "Calculate GST breakdowns, validate HSN/SAC codes, and compute GSTR-1 summary figures. Handles multi-state transactions and reverse charge mechanism.",
    category: "finance",
    priceUsd: 14,
    tags: ["gst", "tax", "hsn", "india"],
    featured: false,
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description:
      "Deep code review with structured JSON output. Catches security vulnerabilities, TypeScript anti-patterns, and performance regressions. GitHub Actions ready.",
    category: "developer",
    priceUsd: 14,
    tags: ["typescript", "security", "ci", "review"],
    featured: true,
  },
  {
    id: "pr-description",
    name: "PR Description Writer",
    description:
      "Turn a git diff into a complete PR description: summary, test plan, screenshots section, and risk flags. Reads your existing PR template automatically.",
    category: "developer",
    priceUsd: 9,
    tags: ["git", "github", "pr", "docs"],
    featured: false,
  },
  {
    id: "iot-firmware-scaffold",
    name: "IoT Firmware Scaffold",
    description:
      "Generate ESP32 / STM32 / nRF firmware skeletons with pin definitions, interrupt handlers, FreeRTOS task structures, and MQTT publishing boilerplate.",
    category: "iot",
    priceUsd: 24,
    tags: ["esp32", "stm32", "firmware", "mqtt"],
    featured: true,
  },
  {
    id: "iot-device-registry-schema",
    name: "IoT Device Registry Schema",
    description:
      "Generate PostgreSQL + JSONB schemas for IoT device registries. Includes device identity, telemetry config, OTA metadata, and time-series partition strategy.",
    category: "iot",
    priceUsd: 19,
    tags: ["postgresql", "iot", "schema", "timeseries"],
    featured: false,
  },
];

// --- Filter tabs ------------------------------------------------------------

type FilterTab = {
  label: string;
  value: string;
};

const FILTER_TABS: FilterTab[] = [
  { label: "All", value: "all" },
  { label: "Developer", value: "developer" },
  { label: "IoT", value: "iot" },
  { label: "Business", value: "business" },
  { label: "Finance", value: "finance" },
];

// --- Page -------------------------------------------------------------------

export default function SkillsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  // Client-side filter — will be replaced by server query params + React Query
  // once the API is live. Kept simple intentionally.
  const visible = ALL_SKILLS.filter((skill) => {
    const matchesCategory =
      activeFilter === "all" || skill.category === activeFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags.some((t) => t.includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-bg-base">
      {/* ------------------------------------------------------------------ */}
      {/* NAV                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft
              size={15}
              className="text-white/40 group-hover:text-white transition-colors"
            />
            <span className="text-violet-500 font-mono text-lg font-bold">⚡</span>
            <span className="font-semibold text-white text-sm tracking-tight">
              Claude Toolkit
            </span>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Dashboard</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ---------------------------------------------------------------- */}
        {/* PAGE HEADER                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-10">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-2">
            Marketplace
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Skill Packs
          </h1>
          <p className="text-white/45 text-sm max-w-lg">
            Production-tested Claude skills. Install in seconds, run in Claude
            Code or the API. One-time purchase — yours forever.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* FILTER BAR + SEARCH                                               */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          {/* Category tabs */}
          <div
            role="tablist"
            aria-label="Filter by category"
            className="flex items-center gap-1 p-1 rounded-12 bg-bg-s2 border border-border-subtle"
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                role="tab"
                aria-selected={activeFilter === tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={cn(
                  "px-3 py-1.5 rounded-8 text-xs font-medium transition-all duration-150",
                  activeFilter === tab.value
                    ? "bg-violet-500 text-white"
                    : "text-white/50 hover:text-white hover:bg-bg-s3"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills..."
              aria-label="Search skills"
              className={cn(
                "w-full h-9 pl-8 pr-4 rounded-12 bg-bg-s2 border border-border-subtle",
                "text-white text-xs placeholder:text-white/30",
                "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
                "transition-colors"
              )}
            />
          </div>

          {/* Result count */}
          <span className="text-xs text-white/30 ml-auto">
            {visible.length} skill{visible.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* SKILLS GRID                                                       */}
        {/* ---------------------------------------------------------------- */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((skill) => (
              <SkillCard
                key={skill.id}
                {...skill}
                onAddToCart={() => undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-white/40 text-sm mb-2">No skills match your filter.</p>
            <button
              onClick={() => {
                setActiveFilter("all");
                setQuery("");
              }}
              className="text-violet-400 text-sm hover:text-violet-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* ALL-ACCESS UPSELL BANNER                                          */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-16 rounded-16 border border-violet-500/20 bg-bg-surface p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-1">
              All-Access
            </p>
            <h2 className="text-lg font-bold text-white mb-1">
              Get every skill for $29/mo
            </h2>
            <p className="text-white/40 text-sm">
              All current + future skills. API access included. Cancel anytime.
            </p>
          </div>
          <BuyButton
            packId="all-access-monthly"
            packLabel="All-Access Monthly"
            priceDisplay="₹2,407/mo"
          />
        </div>
      </div>
    </main>
  );
}
