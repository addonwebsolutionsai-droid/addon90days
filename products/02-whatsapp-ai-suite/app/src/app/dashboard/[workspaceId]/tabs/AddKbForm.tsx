"use client";

/**
 * AddKbForm — client component.
 * Two modes: paste text or scrape URL.
 * POSTs to /api/workspaces/:id/kb on submit.
 */

import { useState } from "react";
import { Plus, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  workspaceId: string;
}

type Mode = "text" | "url";
type FormState = "idle" | "submitting" | "success" | "error";

export function AddKbForm({ workspaceId }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [textContent, setTextContent] = useState("");
  const [url, setUrl] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const payload =
      mode === "text"
        ? { kind: "text" as const, content: textContent.trim() }
        : { kind: "url" as const, url: url.trim() };

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/kb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        setErrorMsg(data.error?.message ?? "Failed to add knowledge. Try again.");
        setFormState("error");
        return;
      }

      setFormState("success");
      setTextContent("");
      setUrl("");
      // Refresh the page after 1.5s so the list updates
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      setErrorMsg("Network error. Check your connection.");
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 border text-sm"
        style={{
          borderColor: "rgba(34,197,94,0.3)",
          backgroundColor: "rgba(34,197,94,0.06)",
          color: "#22c55e",
        }}
        role="status"
      >
        <CheckCircle size={15} className="shrink-0" />
        Knowledge document added. Reloading...
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors"
        style={{
          borderColor: "rgba(34,197,94,0.3)",
          backgroundColor: "rgba(34,197,94,0.06)",
          color: "#22c55e",
        }}
      >
        <Plus size={14} />
        Add knowledge
      </button>
    );
  }

  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Add knowledge</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setFormState("idle");
            setErrorMsg("");
          }}
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          Cancel
        </button>
      </div>

      {/* Mode toggle */}
      <div
        className="flex rounded-lg border p-0.5"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        {(["text", "url"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={
              mode === m
                ? { backgroundColor: "var(--bg-surface)", color: "#22c55e" }
                : { color: "var(--text-muted)" }
            }
          >
            {m === "text" ? "Paste text" : "Scrape URL"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "text" ? (
          <textarea
            required
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your product catalog, FAQs, pricing, business hours, policies..."
            disabled={formState === "submitting"}
            rows={6}
            maxLength={50_000}
            className="w-full px-3 py-2.5 rounded-lg border text-sm resize-y focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
            style={{
              backgroundColor: "var(--bg-base)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            aria-label="Knowledge base text content"
          />
        ) : (
          <div className="space-y-1.5">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com/products"
              disabled={formState === "submitting"}
              className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
              style={{
                backgroundColor: "var(--bg-base)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              aria-label="URL to scrape for knowledge base"
            />
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              The server will fetch and extract text from this URL. Works best on simple HTML
              pages. JavaScript-heavy SPAs may not extract well.
            </p>
          </div>
        )}

        {formState === "error" && errorMsg && (
          <p className="flex items-center gap-1.5 text-xs text-red-400" role="alert">
            <AlertCircle size={12} className="shrink-0" />
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={
            formState === "submitting" ||
            (mode === "text" ? !textContent.trim() : !url.trim())
          }
          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          {formState === "submitting"
            ? mode === "url"
              ? "Scraping..."
              : "Adding..."
            : "Add document"}
        </button>
      </form>
    </div>
  );
}
