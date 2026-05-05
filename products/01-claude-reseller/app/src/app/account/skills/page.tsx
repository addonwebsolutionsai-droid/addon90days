"use client";

import { useState, useEffect } from "react";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Skill } from "@/lib/database.types";

export default function MySkillsPage() {
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/skills?pageSize=200&sort=trending");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { skills: Skill[]; total: number };
        setSkills(data.skills ?? []);
        setTotal(data.total ?? 0);
      } catch {
        setSkills([]);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const filtered = query
    ? skills.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase()) ||
          s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : skills;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">My Skills</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {loading ? "Loading skills…" : `All ${total} skills available — free for the first year.`}
        </p>
      </div>

      {/* Status banner */}
      <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 flex items-center gap-3 text-sm">
        <Sparkles size={14} className="text-green-500 shrink-0" />
        <span className="font-semibold text-green-500 uppercase tracking-wider text-xs">Live</span>
        <span style={{ color: "var(--text-secondary)" }}>
          Every skill is free for you. Install any of them with one command.
        </span>
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
          placeholder="Search skills by name, category, or tag…"
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
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
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
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0 bg-violet-500"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{skill.title}</div>
                  <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {skill.category}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-green-500/15 text-green-500">
                  Free
                </span>
                <Link
                  href={`/skills/${skill.slug}`}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  Open <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Browse marketplace CTA */}
      <div className="mt-8 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 to-transparent p-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium mb-0.5">Browse the full marketplace</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Filter by category, difficulty, or trending. New skills added daily.
          </div>
        </div>
        <Link
          href="/skills"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
        >
          Browse all
        </Link>
      </div>
    </div>
  );
}
