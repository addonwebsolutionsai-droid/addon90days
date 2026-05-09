"use client";

/**
 * Client island: tutorials list for a given product.
 * Fetches from /api/admin/tutorials?product_id=<id>, renders a table,
 * handles activate/deactivate toggle and delete inline.
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface TutorialRow {
  id: string;
  product_id: string;
  feature_key: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface Props {
  productId: string;
  /** URL path segment, e.g. "p02-chatbase" — used for Edit links */
  productSegment: string;
}

export function TutorialsListClient({ productId, productSegment }: Props) {
  const [rows, setRows] = useState<TutorialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchTutorials = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ product_id: productId });
      if (q !== undefined && q.trim().length > 0) params.set("search", q.trim());
      const res = await fetch(`/api/admin/tutorials?${params.toString()}`);
      const json = (await res.json()) as { data?: TutorialRow[]; error?: { message: string } };
      if (!res.ok) throw new Error(json.error?.message ?? "Request failed");
      setRows(json.data ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { void fetchTutorials(); }, [fetchTutorials]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void fetchTutorials(search);
  };

  const handleToggle = async (id: string) => {
    const res = await fetch(`/api/admin/tutorials/${id}/toggle`, { method: "POST" });
    if (res.ok) void fetchTutorials(search);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete tutorial "${title}" and all its videos?`)) return;
    const res = await fetch(`/api/admin/tutorials/${id}`, { method: "DELETE" });
    if (res.ok) void fetchTutorials(search);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title or feature key…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white
                       placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700"
          >
            Search
          </button>
        </form>
        <Link
          href={`/admin/${productSegment}/tutorials/new`}
          className="rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          + New Tutorial
        </Link>
      </div>

      {/* Error */}
      {error !== null && (
        <p className="rounded bg-red-900/30 px-4 py-2 text-sm text-red-400">{error}</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3 text-left">Feature Key</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-center">Videos</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No tutorials yet. Click &quot;+ New Tutorial&quot; to add the first one.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="bg-zinc-950 hover:bg-zinc-900 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">{row.feature_key}</td>
                <td className="px-4 py-3 text-zinc-100">{row.title}</td>
                <td className="px-4 py-3 text-center text-zinc-400">—</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => void handleToggle(row.id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                      row.is_active
                        ? "bg-green-900/40 text-green-400 hover:bg-green-900/60"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/${productSegment}/tutorials/${row.id}/edit`}
                      className="text-violet-400 hover:text-violet-300 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => void handleDelete(row.id, row.title)}
                      className="text-red-500 hover:text-red-400 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
