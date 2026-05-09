"use client";

/**
 * Client button for deleting a KB doc from the workspace detail page.
 * Calls DELETE /api/admin/chatbase/kb/[kbDocId] then reloads the page.
 */

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  docId: string;
  workspaceId: string;
}

export function KbDeleteButton({ docId, workspaceId: _workspaceId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this KB document? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chatbase/kb/${docId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const json = await res.json() as { error?: { message: string } };
        alert(`Delete failed: ${json.error?.message ?? "unknown error"}`);
      }
    } catch {
      alert("Delete failed — network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => { void handleDelete(); }}
      disabled={loading}
      aria-label="Delete KB document"
      className="ml-1 inline-flex items-center gap-0.5 text-[10px] transition-colors hover:text-red-400 disabled:opacity-50"
      style={{ color: "var(--text-muted)" }}
    >
      {loading ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
      Delete
    </button>
  );
}
