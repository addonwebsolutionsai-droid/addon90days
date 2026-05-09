"use client";

/**
 * Client form for editing an existing intent.
 * intent_key is read-only (displayed, not editable).
 * Delete button appears for workspace-specific intents only.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import type { P02Intent } from "@/lib/p02/types";

interface Props {
  intent: P02Intent;
  backHref: string;
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:border-violet-500 transition-colors " +
  "border-[var(--border-subtle)] text-[var(--text-primary)]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl border p-5 space-y-4"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label, required = false, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium">
          {label} {required && <span className="text-red-400">*</span>}
        </span>
        {hint !== undefined && (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}

export function EditIntentForm({ intent, backHref }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName]                 = useState(intent.name);
  const [systemPrompt, setSystemPrompt] = useState(intent.system_prompt);
  const [threshold, setThreshold]       = useState(String(intent.threshold));
  const [busy, setBusy]                 = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const isCustom = intent.workspace_id !== null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/intents/${intent.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:          name.trim(),
          system_prompt: systemPrompt.trim(),
          threshold:     Number(threshold),
        }),
      });
      const json = await res.json() as { data?: unknown; error?: { message: string } };
      if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      startTransition(() => router.push(backHref));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete intent "${intent.intent_key}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/intents/${intent.id}`, { method: "DELETE" });
      const json = await res.json() as { data?: unknown; error?: { message: string } };
      if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      startTransition(() => router.push(backHref));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section title="Identity">
        <Field label="Intent key" hint="Stable identifier — cannot be changed">
          <div
            className={`${inputClass} font-mono opacity-60 cursor-not-allowed`}
            aria-readonly="true"
          >
            {intent.intent_key}
          </div>
        </Field>
        <Field label="Display name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Behaviour">
        <Field label="System prompt" required hint="50–2000 chars">
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            required
            minLength={50}
            maxLength={2000}
            rows={6}
            className={inputClass}
          />
          <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-muted)" }}>
            {systemPrompt.length} / 2000
          </p>
        </Field>

        <Field label="Confidence threshold" required hint="0–1. Below this, escalate to human">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              min={0}
              max={1}
              step={0.05}
              required
              className={`${inputClass} max-w-[120px]`}
            />
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Below this confidence score, the bot escalates to a human agent.
            </p>
          </div>
        </Field>
      </Section>

      {error !== null && (
        <p
          className="text-xs px-3 py-2 rounded-lg border"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.30)", color: "#fca5a5" }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
        {/* Delete — only for custom (workspace-scoped) intents */}
        {isCustom ? (
          <button
            type="button"
            onClick={() => { void handleDelete(); }}
            disabled={deleting || busy || isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-red-900/30 disabled:opacity-50"
            style={{ borderColor: "rgba(239,68,68,0.35)", color: "#fca5a5" }}
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete intent
          </button>
        ) : (
          <span className="text-[11px] italic" style={{ color: "var(--text-muted)" }}>
            Global defaults cannot be deleted.
          </span>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-lg border text-sm transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || isPending || name.trim().length === 0 || systemPrompt.trim().length < 50}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {(busy || isPending) && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </form>
  );
}
