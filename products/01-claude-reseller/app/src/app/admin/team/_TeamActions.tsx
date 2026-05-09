"use client";

/**
 * TeamActions — client island for /admin/team.
 * Form: paste a Clerk user ID + pick a role + click Assign.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { RoleRow } from "@/lib/rbac-admin";

export function TeamActions({ roles }: { roles: RoleRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clerkUserId, setClerkUserId] = useState("");
  const [roleId, setRoleId]           = useState(roles[0]?.id ?? "");
  const [busy, setBusy]               = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/team/assign", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ clerk_user_id: clerkUserId.trim(), role_id: roleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      setSuccess(`Role assigned. The user's permissions cache invalidates within 5 minutes.`);
      setClerkUserId("");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
      <label className="block">
        <span className="text-[10px] uppercase tracking-wider font-semibold mb-1 block" style={{ color: "var(--text-muted)" }}>
          Clerk user ID
        </span>
        <input
          type="text"
          value={clerkUserId}
          onChange={(e) => setClerkUserId(e.target.value)}
          placeholder="user_2..."
          required
          className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
        />
      </label>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider font-semibold mb-1 block" style={{ color: "var(--text-muted)" }}>
          Role
        </span>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          required
          className="px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:border-violet-500 transition-colors"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.scope})
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={busy || isPending || clerkUserId.trim().length === 0 || roleId === ""}
        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {(busy || isPending) && <Loader2 size={14} className="animate-spin" />}
        Assign
      </button>

      {error !== null && <p className="sm:col-span-3 text-xs" style={{ color: "#fca5a5" }}>{error}</p>}
      {success !== null && <p className="sm:col-span-3 text-xs" style={{ color: "#4ade80" }}>{success}</p>}
    </form>
  );
}
