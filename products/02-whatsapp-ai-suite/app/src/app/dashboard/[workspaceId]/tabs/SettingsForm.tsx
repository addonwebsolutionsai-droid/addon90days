"use client";

/**
 * SettingsForm — client component.
 * Editable: business_name, escalation_threshold.
 * PATCHes to /api/workspaces/:id/patch.
 */

import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { P02Workspace } from "@/lib/p02/types";

interface Props {
  workspace: P02Workspace;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsForm({ workspace }: Props) {
  const [businessName, setBusinessName] = useState(workspace.business_name);
  const [threshold, setThreshold] = useState(workspace.escalation_threshold);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName.trim(),
          escalation_threshold: threshold,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        setErrorMsg(data.error?.message ?? "Failed to save. Try again.");
        setSaveState("error");
        return;
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch {
      setErrorMsg("Network error. Check your connection.");
      setSaveState("error");
    }
  }

  const isDirty =
    businessName.trim() !== workspace.business_name ||
    threshold !== workspace.escalation_threshold;

  return (
    <form
      onSubmit={handleSave}
      className="rounded-xl border p-5 space-y-4"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Business name */}
      <div className="space-y-1.5">
        <label
          htmlFor="business-name"
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Business name
        </label>
        <input
          id="business-name"
          type="text"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          maxLength={120}
          disabled={saveState === "saving"}
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 transition-colors"
          style={{
            backgroundColor: "var(--bg-base)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Escalation threshold */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="escalation-threshold"
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Escalation threshold
          </label>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e" }}
          >
            {threshold.toFixed(2)}
          </span>
        </div>
        <input
          id="escalation-threshold"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          disabled={saveState === "saving"}
          className="w-full accent-green-500"
          aria-label={`Escalation threshold: ${threshold.toFixed(2)}`}
        />
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          AI confidence below this value routes the conversation to your inbox. Default: 0.70.
          Lower = more human intervention. Higher = AI handles more.
        </p>
      </div>

      {/* Save button + feedback */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saveState === "saving" || !isDirty}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          {saveState === "saving" ? "Saving..." : "Save changes"}
        </button>

        {saveState === "saved" && (
          <span className="flex items-center gap-1.5 text-xs text-green-400" role="status">
            <CheckCircle size={12} />
            Saved
          </span>
        )}
        {saveState === "error" && errorMsg && (
          <span className="flex items-center gap-1.5 text-xs text-red-400" role="alert">
            <AlertCircle size={12} />
            {errorMsg}
          </span>
        )}
      </div>
    </form>
  );
}
