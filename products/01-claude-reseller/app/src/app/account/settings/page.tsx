"use client";

// metadata cannot be exported from "use client" pages — title set in account layout
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { User, Bell, Key, Copy, Check, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const [displayName, setDisplayName] = useState(
    user?.fullName ?? user?.firstName ?? ""
  );
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const apiKey =
    (user?.publicMetadata?.["apiKey"] as string | undefined) ??
    "ct_live_placeholder_key_00000000";

  async function handleSaveName() {
    if (!user) return;
    setSaving(true);
    try {
      const parts = displayName.trim().split(" ");
      await user.update({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyKey() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your profile, notifications, and API key.
        </p>
      </div>

      {/* Display name */}
      <section
        className="rounded-xl border p-5 mb-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-violet-400" />
          <span className="text-sm font-semibold">Display name</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="flex-1 h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            style={{
              backgroundColor: "var(--bg-s2)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={() => void handleSaveName()}
            disabled={saving}
            className="h-10 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            {saved ? (
              <>
                <Check size={13} /> Saved
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              "Save"
            )}
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section
        className="rounded-xl border p-5 mb-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell size={15} className="text-violet-400" />
          <span className="text-sm font-semibold">Notifications</span>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="text-sm">Email notifications</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              New skills, promotions, and product updates
            </div>
          </div>
          <button
            role="switch"
            aria-checked={emailNotifs}
            onClick={() => setEmailNotifs((v) => !v)}
            className="relative w-10 h-5 rounded-full transition-colors"
            style={{ backgroundColor: emailNotifs ? "#7c3aed" : "var(--bg-s3)" }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              style={{ transform: emailNotifs ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </label>
      </section>

      {/* API Key */}
      <section
        className="rounded-xl border p-5"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Key size={15} className="text-violet-400" />
          <span className="text-sm font-semibold">API key</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <code
            className="flex-1 h-10 px-3 rounded-lg text-sm font-mono flex items-center border truncate"
            style={{
              backgroundColor: "var(--bg-s2)",
              borderColor: "var(--border)",
              color: "#22c55e",
            }}
          >
            {apiKey}
          </code>
          <button
            onClick={() => void handleCopyKey()}
            aria-label="Copy API key"
            className="h-10 px-3 rounded-lg border text-xs transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: "var(--bg-s2)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            aria-label="Regenerate API key"
            title="Regenerate API key (coming soon)"
            className="h-10 px-3 rounded-lg border text-xs transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: "var(--bg-s2)",
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Use as{" "}
          <code
            className="px-1 rounded text-xs"
            style={{ backgroundColor: "var(--bg-s2)", color: "var(--text-secondary)" }}
          >
            Authorization: Bearer &lt;key&gt;
          </code>{" "}
          or set the{" "}
          <code
            className="px-1 rounded text-xs"
            style={{ backgroundColor: "var(--bg-s2)", color: "var(--text-secondary)" }}
          >
            CLAUDE_TOOLKIT_API_KEY
          </code>{" "}
          env var.
        </p>
      </section>
    </div>
  );
}
