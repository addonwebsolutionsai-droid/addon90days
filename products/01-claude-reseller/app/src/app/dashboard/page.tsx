"use client";

import { useUser } from "@clerk/nextjs";
import { CheckCircle, Zap, Key, BarChart3, Package } from "lucide-react";
import { clsx } from "clsx";

const ALL_PACKS = [
  {
    id: "iot-developer-pack",
    name: "IoT Developer Pack",
    price: "₹4,067",
    skills: ["iot-firmware-scaffold", "iot-device-registry-schema", "iot-ota-pipeline"],
    accent: "cyan",
  },
  {
    id: "developer-productivity-pack",
    name: "Developer Productivity Pack",
    price: "₹2,407",
    skills: ["code-reviewer", "sql-query-builder", "test-generator", "pr-description"],
    accent: "violet",
  },
  {
    id: "smb-operations-pack",
    name: "SMB Operations Pack",
    price: "₹2,407",
    skills: ["invoice-generator", "gst-calculator", "email-drafter"],
    accent: "green",
  },
] as const;

const FREE_SKILLS = ["invoice-generator", "gst-calculator", "email-drafter", "pr-description"];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const purchasedPacks = (user?.publicMetadata?.["purchasedPacks"] as string[] | undefined) ?? [];
  const apiKey = (user?.publicMetadata?.["apiKey"] as string | undefined) ?? "generate-key-coming-soon";

  const allAccessibleSkills = new Set([
    ...FREE_SKILLS,
    ...purchasedPacks.flatMap((pack) =>
      ALL_PACKS.find((p) => p.id === pack)?.skills ?? []
    ),
  ]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap size={14} />
          </div>
          <span className="font-semibold text-sm">Claude Toolkit</span>
        </div>
        <span className="text-xs text-white/40">{user?.primaryEmailAddress?.emailAddress}</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Package, label: "Packs owned", value: purchasedPacks.length === 0 ? "0" : purchasedPacks.length.toString() },
            { icon: Zap, label: "Skills unlocked", value: allAccessibleSkills.size.toString() },
            { icon: BarChart3, label: "API calls today", value: "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#0f0f12] rounded-xl border border-white/5 p-5">
              <Icon size={16} className="text-violet-400 mb-3" />
              <div className="text-2xl font-bold tabular-nums">{value}</div>
              <div className="text-xs text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* API Key */}
        <div className="bg-[#0f0f12] rounded-xl border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Key size={14} className="text-violet-400" />
            <span className="text-sm font-medium">Your API Key</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-[#161619] rounded-lg px-4 py-2.5 text-sm text-green-400 font-mono truncate">
              {apiKey}
            </code>
            <button
              onClick={() => void navigator.clipboard.writeText(apiKey)}
              className="px-3 py-2.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-white/30 mt-2">Use this key in the <code className="text-white/50">GEMINI_API_KEY</code> env var or pass as <code className="text-white/50">Authorization: Bearer</code> header.</p>
        </div>

        {/* Packs */}
        <div>
          <h2 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wider">Skill Packs</h2>
          <div className="space-y-3">
            {ALL_PACKS.map((pack) => {
              const owned = purchasedPacks.includes(pack.id);
              return (
                <div
                  key={pack.id}
                  className={clsx(
                    "bg-[#0f0f12] rounded-xl border p-5 flex items-center justify-between",
                    owned ? "border-violet-500/30" : "border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {owned && <CheckCircle size={16} className="text-violet-400 shrink-0" />}
                    {!owned && <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />}
                    <div>
                      <div className="font-medium text-sm">{pack.name}</div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {pack.skills.length} skills · {pack.price}
                      </div>
                    </div>
                  </div>
                  {owned ? (
                    <span className="text-xs text-violet-400 font-medium">Owned</span>
                  ) : (
                    <a
                      href={`/skills?buy=${pack.id}`}
                      className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
                    >
                      Buy {pack.price}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills list */}
        <div>
          <h2 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wider">Your Skills</h2>
          <div className="bg-[#0f0f12] rounded-xl border border-white/5 divide-y divide-white/5">
            {Array.from(allAccessibleSkills).map((skillId) => (
              <div key={skillId} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <code className="text-sm text-white/80">{skillId}</code>
                </div>
                <span className="text-xs text-white/30">
                  {FREE_SKILLS.includes(skillId) ? "Free" : "Paid"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quickstart */}
        <div className="bg-[#0f0f12] rounded-xl border border-white/5 p-5">
          <h2 className="text-sm font-medium mb-4">Quickstart</h2>
          <pre className="text-xs text-green-400 font-mono bg-[#07070a] rounded-lg p-4 overflow-x-auto">
{`# Install
npm install @addonweb/claude-toolkit

# Run a skill
import { invoiceGenerator, runSkill } from "@addonweb/claude-toolkit"

const result = await runSkill(invoiceGenerator, {
  sellerName: "Your Company",
  buyerName: "Client Name",
  invoiceNumber: "INV-001",
  invoiceDate: "2026-05-01",
  lineItems: [{ description: "Services", quantity: 1, unit: "Nos", ratePerUnit: 50000, gstRate: 18 }],
  currency: "INR"
})

console.log(result.data.summary) // { subtotal, totalGst, totalAmount }`}
          </pre>
        </div>

      </div>
    </div>
  );
}
