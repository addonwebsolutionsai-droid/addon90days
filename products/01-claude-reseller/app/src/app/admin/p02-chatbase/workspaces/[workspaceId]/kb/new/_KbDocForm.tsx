"use client";

/**
 * Client form for creating a KB document.
 * Tab UI: Text | URL | PDF (disabled).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye } from "lucide-react";

interface Props {
  workspaceId: string;
}

type Tab = "text" | "url" | "pdf";

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

export function KbDocForm({ workspaceId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<Tab>("text");
  const [rawContent, setRawContent] = useState("");
  const [sourceUrl, setSourceUrl]   = useState("");
  const [preview, setPreview]       = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [busy, setBusy]             = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function fetchPreview() {
    if (sourceUrl.trim().length === 0) return;
    setPreviewLoading(true);
    setPreview(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/chatbase/kb/preview-url", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url: sourceUrl.trim() }),
      });
      const json = await res.json() as { data?: { preview: string; total_chars: number }; error?: { message: string } };
      if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      setPreview(json.data?.preview ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload =
      activeTab === "text"
        ? { kind: "text" as const, raw_content: rawContent.trim() }
        : { kind: "url" as const, source_url: sourceUrl.trim() };

    try {
      const res = await fetch(`/api/admin/chatbase/workspaces/${workspaceId}/kb`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const json = await res.json() as { data?: unknown; error?: { message: string } };
      if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      startTransition(() => router.push(`/admin/p02-chatbase/workspaces/${workspaceId}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  const tabs: { key: Tab; label: string; disabled?: boolean; tooltip?: string }[] = [
    { key: "text", label: "Text" },
    { key: "url",  label: "URL" },
    { key: "pdf",  label: "PDF", disabled: true, tooltip: "PDF ingestion coming soon" },
  ];

  const canSubmit = activeTab === "text"
    ? rawContent.trim().length >= 50
    : sourceUrl.trim().length > 0;

  return (
    <form onSubmit={(e) => { void submit(e); }} className="space-y-5">
      {/* Tab switcher */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        role="tablist"
      >
        {tabs.map((tab) => (
          <div key={tab.key} title={tab.tooltip}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-disabled={tab.disabled ?? false}
              onClick={() => { if (!(tab.disabled ?? false)) setActiveTab(tab.key); }}
              className={[
                "px-4 py-1.5 rounded-lg text-xs font-medium transition-colors",
                tab.disabled === true ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                activeTab === tab.key && !(tab.disabled ?? false)
                  ? "bg-violet-600 text-white"
                  : "hover:bg-white/5",
              ].join(" ")}
              style={activeTab !== tab.key ? { color: "var(--text-secondary)" } : undefined}
            >
              {tab.label}
              {tab.disabled === true && (
                <span className="ml-1 text-[9px]">soon</span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Text tab */}
      {activeTab === "text" && (
        <Section title="Text content">
          <Field label="Raw content" required hint="50–50 000 chars">
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              required
              minLength={50}
              maxLength={50_000}
              rows={12}
              placeholder="Paste your knowledge base content here..."
              className={inputClass}
            />
            <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-muted)" }}>
              {rawContent.length.toLocaleString()} / 50 000
            </p>
          </Field>
        </Section>
      )}

      {/* URL tab */}
      {activeTab === "url" && (
        <Section title="URL source">
          <Field label="Source URL" required hint="Page will be scraped server-side">
            <div className="flex gap-2">
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => { setSourceUrl(e.target.value); setPreview(null); }}
                placeholder="https://example.com/faq"
                required
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => { void fetchPreview(); }}
                disabled={previewLoading || sourceUrl.trim().length === 0}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
              >
                {previewLoading ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
                Preview
              </button>
            </div>
          </Field>

          {preview !== null && (
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1.5 font-semibold" style={{ color: "var(--text-muted)" }}>
                Scraped preview (first 2000 chars)
              </p>
              <div
                className="rounded-lg border p-3 text-xs leading-relaxed whitespace-pre-wrap overflow-auto max-h-64"
                style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
              >
                {preview}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* PDF tab (disabled content) */}
      {activeTab === "pdf" && (
        <Section title="PDF upload">
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
            PDF ingestion is coming soon.
          </p>
        </Section>
      )}

      {error !== null && (
        <p
          className="text-xs px-3 py-2 rounded-lg border"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.30)", color: "#fca5a5" }}
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
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
          disabled={busy || isPending || !canSubmit || activeTab === "pdf"}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {(busy || isPending) && <Loader2 size={14} className="animate-spin" />}
          Save document
        </button>
      </div>
    </form>
  );
}
