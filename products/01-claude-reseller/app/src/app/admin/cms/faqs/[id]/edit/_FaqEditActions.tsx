"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import type { CmsFaq } from "@/lib/cms/db";

export function FaqEditActions({ faq }: { faq: CmsFaq }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cms/faqs/${faq.id}/toggle`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error ?? `HTTP ${res.status}`);
      }
      startTransition(() => router.push("/admin/cms?kind=faqs"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  const isLoading = busy || isPending;

  return (
    <section
      className="rounded-xl border p-5 space-y-3"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "rgba(239,68,68,0.3)" }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-red-400">Actions</h2>
      <button
        onClick={() => void toggle()}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-colors hover:bg-white/5 disabled:opacity-50"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        {isLoading
          ? <Loader2 size={13} className="animate-spin" />
          : faq.is_active ? <ToggleRight size={13} className="text-green-400" /> : <ToggleLeft size={13} className="text-zinc-400" />}
        {faq.is_active ? "Deactivate" : "Activate"}
      </button>
      {error !== null && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}
