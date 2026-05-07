/**
 * IntentsTab — server component (read-only for v1).
 *
 * Displays the 6 seeded intents from the workspace.
 * Intent editing is deferred to v1.1.
 */

import type { P02Intent } from "@/lib/p02/types";
import { Tag } from "lucide-react";

interface Props {
  intents: P02Intent[];
}

// Escalation indicator: complaint and unknown have threshold 1.0 by default
function ThresholdBadge({ threshold }: { threshold: number }) {
  const isForceEscalate = threshold >= 1.0;
  return (
    <span
      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
      style={
        isForceEscalate
          ? { backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }
          : { backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e" }
      }
      title={isForceEscalate ? "Always escalates to human" : "AI confidence threshold"}
    >
      {isForceEscalate ? "force-escalate" : threshold.toFixed(2)}
    </span>
  );
}

export function IntentsTab({ intents }: Props) {
  if (intents.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed p-10 text-center"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Tag size={22} className="text-green-500 mx-auto mb-3" />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Intents load automatically once setup is complete. If you see this,
          the database migration is still being applied — check back in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">Intent library</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Every incoming message is classified into one of these intents before the AI responds.
          Intent editing is available in v1.1.
        </p>
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-[1fr_1fr_auto_2fr] gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        <span>Name</span>
        <span>Key</span>
        <span>Threshold</span>
        <span>System prompt (excerpt)</span>
      </div>

      <div className="space-y-1.5">
        {intents.map((intent) => (
          <div
            key={intent.id}
            className="grid grid-cols-[1fr_1fr_auto_2fr] gap-4 items-start px-4 py-3.5 rounded-lg border"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <span className="text-sm font-medium">{intent.name}</span>

            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded self-start"
              style={{
                backgroundColor: "rgba(6,182,212,0.08)",
                color: "#06b6d4",
              }}
            >
              {intent.intent_key}
            </span>

            <ThresholdBadge threshold={intent.threshold} />

            <p
              className="text-xs leading-relaxed line-clamp-2"
              style={{ color: "var(--text-secondary)" }}
              title={intent.system_prompt}
            >
              {intent.system_prompt}
            </p>
          </div>
        ))}
      </div>

      <p
        className="text-xs px-1"
        style={{ color: "var(--text-muted)" }}
      >
        Intent editing, custom intents, and per-intent override prompts are planned for v1.1.
      </p>
    </div>
  );
}
