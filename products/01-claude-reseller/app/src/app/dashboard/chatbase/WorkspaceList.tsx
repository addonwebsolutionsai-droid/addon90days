"use client";

/**
 * WorkspaceList — client component.
 *
 * Renders existing workspaces and a "New workspace" inline form.
 * On create: POSTs to /api/p02/workspaces, then navigates to the new workspace.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Building2 } from "lucide-react";
import type { P02Workspace } from "@/lib/p02/types";

interface Props {
  initialWorkspaces: P02Workspace[];
}

type FormState = "idle" | "submitting" | "error";

export function WorkspaceList({ initialWorkspaces }: Props) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<P02Workspace[]>(initialWorkspaces);
  const [showForm, setShowForm] = useState(initialWorkspaces.length === 0);
  const [businessName, setBusinessName] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = businessName.trim();
    if (!name || formState === "submitting") return;

    setFormState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/p02/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_name: name }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        setErrorMsg(data.error?.message ?? "Failed to create workspace. Try again.");
        setFormState("error");
        return;
      }

      const data = (await res.json()) as { data: P02Workspace };
      const newWorkspace = data.data;
      setWorkspaces((prev) => [newWorkspace, ...prev]);
      setBusinessName("");
      setFormState("idle");
      // Navigate straight to the new workspace
      router.push(`/dashboard/chatbase/${newWorkspace.id}`);
    } catch {
      setErrorMsg("Network error. Check your connection and try again.");
      setFormState("error");
    }
  }

  return (
    <div className="space-y-5">
      {/* Existing workspaces */}
      {workspaces.length > 0 && (
        <div className="space-y-2.5">
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {workspaces.length === 0 && !showForm && (
        <div
          className="rounded-xl border border-dashed p-10 text-center"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
          >
            <Building2 size={22} className="text-green-500" />
          </div>
          <h2 className="font-semibold mb-1">No ChatBase workspace yet</h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            Create one to start. Each workspace connects to one WhatsApp Business number.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            Create workspace
          </button>
        </div>
      )}

      {/* Create workspace form */}
      {(showForm || workspaces.length > 0) && (
        <div>
          {workspaces.length > 0 && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-secondary)",
                backgroundColor: "var(--bg-surface)",
              }}
            >
              <Plus size={14} />
              New workspace
            </button>
          )}

          {showForm && (
            <div
              className="rounded-xl border p-5"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <h2 className="font-semibold text-sm mb-4">New workspace</h2>
              <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Business name (e.g. Sharma Electronics)"
                  disabled={formState === "submitting"}
                  maxLength={120}
                  className="flex-1 px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 transition-colors"
                  style={{
                    backgroundColor: "var(--bg-base)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  aria-label="Business name for new ChatBase workspace"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={formState === "submitting" || !businessName.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    {formState === "submitting" ? (
                      "Creating..."
                    ) : (
                      <>
                        Create <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                  {workspaces.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setErrorMsg("");
                        setFormState("idle");
                      }}
                      className="px-4 py-2 rounded-lg border text-sm transition-colors"
                      style={{
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              {(formState === "error") && errorMsg && (
                <p className="text-xs text-red-400 mt-2" role="alert">
                  {errorMsg}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkspaceCard({ workspace }: { workspace: P02Workspace }) {
  const isComplete =
    workspace.whatsapp_phone_number_id !== null && !workspace.mock_mode;

  return (
    <a
      href={`/dashboard/chatbase/${workspace.id}`}
      className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-green-500/40 hover:bg-green-500/5 group"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
      >
        <Building2 size={18} className="text-green-500" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{workspace.business_name}</div>
        <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
          <span>
            Created{" "}
            {new Date(workspace.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {workspace.mock_mode && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                backgroundColor: "rgba(6,182,212,0.1)",
                color: "#06b6d4",
              }}
            >
              Mock mode
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
        style={
          isComplete
            ? { backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e" }
            : { backgroundColor: "rgba(251,191,36,0.1)", color: "#fbbf24" }
        }
      >
        {isComplete ? "Active" : "Setup incomplete"}
      </span>

      <ArrowRight
        size={15}
        className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
        style={{ color: "#22c55e" }}
      />
    </a>
  );
}
