"use client";

/**
 * TrySkillLive — inline live-demo form on every /skills/[slug] page.
 *
 * Lets visitors run any catalog skill directly in the browser without
 * installing Claude Code. Calls POST /api/skills/run with free-form
 * string input, renders the response inline.
 *
 * UX principles:
 *   - Sign-in required (matches site-wide policy). Unauthed users see a
 *     "Sign in to try" button that bounces through /sign-in?redirect_url.
 *   - Single textarea + run button. No form-per-skill complexity.
 *   - Result rendered as Markdown-ish (preserves whitespace + code blocks).
 *   - Friendly error handling — never leaves the user staring at a spinner.
 *
 * Conversion intent: this is the demo that turns visitors into sign-ups.
 * Don't over-engineer it; speed to first output matters more than polish.
 */

import { useState, useRef } from "react";
import Link from "next/link";
import { Play, Loader2, ArrowRight, X, Sparkles, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  slug:          string;
  title:         string;
  defaultInput?: string;
  isSignedIn:    boolean;
}

interface RunResult {
  text:       string;
  durationMs: number;
  runner:     "typed" | "generic";
}

export function TrySkillLive({ slug, title, defaultInput, isSignedIn }: Props) {
  const [input, setInput]       = useState(defaultInput ?? "");
  const [running, setRunning]   = useState(false);
  const [result, setResult]     = useState<RunResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const abortRef                = useRef<AbortController | null>(null);

  async function handleRun(e?: React.FormEvent) {
    e?.preventDefault();
    if (running || input.trim().length === 0) return;

    setRunning(true);
    setError(null);
    setResult(null);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch("/api/skills/run", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ skillId: slug, input: input.trim() }),
        signal:  ac.signal,
      });

      if (res.status === 401 || res.status === 404) {
        // 401 = explicit unauthenticated. 404 = Clerk middleware blocked
        // an unauth API request (Clerk's default behavior). Both mean
        // "your session isn't reaching the API" — surface the same UX.
        setError("Your session expired. Sign in again to run skills.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as { error?: string }));
        const msg  = (body as { error?: string }).error ?? `Server returned ${res.status}. Please retry in a moment.`;
        setError(msg.length > 240 ? `${msg.slice(0, 240)}…` : msg);
        return;
      }

      const json = await res.json() as {
        data: { content?: string } | unknown;
        meta: { runner: "typed" | "generic"; durationMs: number };
      };

      // Typed runner returns structured data; catalog runner returns { content }.
      // For the inline display, render content if present, else stringify the
      // whole data object as JSON.
      const text = typeof (json.data as { content?: string }).content === "string"
        ? (json.data as { content: string }).content
        : JSON.stringify(json.data, null, 2);

      setResult({ text, durationMs: json.meta.durationMs, runner: json.meta.runner });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    setRunning(false);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — silently no-op */ }
  }

  function handleClear() {
    setResult(null);
    setError(null);
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden mb-4"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor:     "var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/30 to-pink-600/20 flex items-center justify-center">
            <Sparkles size={13} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              Try this skill live
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Runs in your browser — free, no install needed
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-violet-500/15 text-violet-400 font-semibold">
          Live
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleRun} className="px-5 py-4 space-y-3">
        <label className="block">
          <span className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
            What do you want {title} to do?
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={running}
            placeholder={`Describe your task in plain English. Example: "Create a GST invoice for Acme Corp, software services, ₹50,000."`}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y min-h-[80px]"
            style={{
              backgroundColor: "var(--bg-base)",
              borderColor:     "var(--border)",
              color:           "var(--text-primary)",
            }}
          />
        </label>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {isSignedIn
              ? "Powered by Llama 3.3 70B · ~5–15 sec"
              : "Sign in (free) to try this live."}
          </p>
          {isSignedIn ? (
            running ? (
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm font-medium transition-colors"
              >
                <X size={13} />
                Cancel
              </button>
            ) : (
              <button
                type="submit"
                disabled={input.trim().length === 0}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  input.trim().length === 0
                    ? "bg-violet-600/30 text-violet-300/50 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                )}
              >
                <Play size={13} />
                Run live
              </button>
            )
          ) : (
            <Link
              href={`/sign-in?redirect_url=/skills/${slug}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              Sign in to try <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </form>

      {/* Loading state */}
      {running && (
        <div
          className="px-5 py-4 border-t flex items-center gap-2 text-sm"
          style={{
            borderColor:     "var(--border-subtle)",
            backgroundColor: "var(--bg-s2)",
            color:           "var(--text-secondary)",
          }}
        >
          <Loader2 size={14} className="animate-spin text-violet-400" />
          Running {title}…
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="px-5 py-3 border-t border-red-500/20 bg-red-500/5 text-sm"
          style={{ color: "#fca5a5" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span>{error}</span>
              {/^Your session expired/.test(error) && (
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(`/skills/${slug}`)}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
                >
                  Sign in <ArrowRight size={11} />
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              aria-label="Dismiss"
              className="shrink-0 hover:text-red-200 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className="border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="px-5 py-2 flex items-center justify-between text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            <span>
              Done in {(result.durationMs / 1000).toFixed(1)}s · runner: {result.runner}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
              >
                {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
              >
                <X size={11} />
                Clear
              </button>
            </div>
          </div>
          <pre
            className="px-5 py-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words leading-relaxed"
            style={{
              backgroundColor: "#0f0f12",
              color:           "rgba(255,255,255,0.85)",
              maxHeight:       "500px",
              overflowY:       "auto",
            }}
          >
            <code>{result.text}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
