"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ShieldOff, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

interface AdminUser {
  id:            string;
  primaryEmail:  string | null;
  firstName:     string | null;
  lastName:      string | null;
  createdAt:     number;
  lastSignInAt:  number | null;
  banned:        boolean;
  imageUrl:      string;
  emailVerified: boolean;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page:  number;
  limit: number;
}

const PAGE_SIZE = 25;

export function UsersTable() {
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [busyIds, setBusyIds]   = useState<Set<string>>(new Set());

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/users?page=${p}&limit=${PAGE_SIZE}${q.length > 0 ? `&search=${encodeURIComponent(q)}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as UsersResponse;
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(page, search); }, [page, search, load]);

  async function toggleBan(u: AdminUser) {
    const next = new Set(busyIds);
    next.add(u.id);
    setBusyIds(next);
    try {
      const method = u.banned ? "DELETE" : "POST";
      const res = await fetch(`/api/admin/users/${u.id}/ban`, { method });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, banned: !u.banned } : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      const after = new Set(busyIds);
      after.delete(u.id);
      setBusyIds(after);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* Search */}
      <div
        className="relative flex items-center"
        style={{ color: "var(--text-secondary)" }}
      >
        <Search size={14} className="absolute left-3" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor:     "var(--border)",
            color:           "var(--text-primary)",
          }}
        />
      </div>

      {/* Error banner */}
      {error !== null && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-sm" style={{ color: "#fca5a5" }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
        {loading ? "Loading…" : `${total.toLocaleString()} total user${total === 1 ? "" : "s"}`}
        {!loading && total > 0 && ` · page ${page} of ${totalPages}`}
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Last seen</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  <Loader2 size={20} className="inline animate-spin text-violet-400" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  No users yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.imageUrl}
                        alt=""
                        className="w-7 h-7 rounded-full border"
                        style={{ borderColor: "var(--border-subtle)" }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {[u.firstName, u.lastName].filter((s) => s !== null).join(" ") || "—"}
                        </div>
                        <div className="text-[11px] truncate font-mono" style={{ color: "var(--text-muted)" }}>
                          {u.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{u.primaryEmail ?? "—"}</span>
                      {u.emailVerified ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400" title="Verified">✓</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400" title="Unverified">!</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                    {formatRelative(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                    {u.lastSignInAt !== null ? formatRelative(u.lastSignInAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.banned ? (
                      <span className="text-[11px] px-2 py-1 rounded bg-red-500/15 text-red-400 font-medium">
                        Banned
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-1 rounded bg-green-500/15 text-green-400 font-medium">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void toggleBan(u)}
                      disabled={busyIds.has(u.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-colors hover:bg-white/5 disabled:opacity-40"
                      style={{ borderColor: "var(--border)", color: u.banned ? "#22c55e" : "#f87171" }}
                    >
                      {busyIds.has(u.id) ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : u.banned ? (
                        <ShieldCheck size={12} />
                      ) : (
                        <ShieldOff size={12} />
                      )}
                      {u.banned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded border transition-colors hover:bg-white/5 disabled:opacity-40"
            style={{ borderColor: "var(--border)" }}
          >
            ← Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-3 py-1.5 rounded border transition-colors hover:bg-white/5 disabled:opacity-40"
            style={{ borderColor: "var(--border)" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
