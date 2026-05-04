/**
 * KnowledgeTab — server component shell + AddKbForm client component.
 *
 * Lists existing KB documents and provides a form to add new ones (text or URL).
 * Delete endpoint doesn't exist yet — button shows "coming soon" state.
 */

import type { P02KbDoc } from "@/lib/p02/types";
import { AddKbForm } from "./AddKbForm";
import { BookOpen, FileText, Globe } from "lucide-react";

interface Props {
  docs: P02KbDoc[];
  workspaceId: string;
}

// Slim shape returned by the /kb/list API
interface KbDocSlim {
  id: string;
  workspace_id: string;
  kind: "text" | "url" | "pdf";
  source_url: string | null;
  chunk_count: number;
  preview: string;
  created_at: string;
}

function kindIcon(kind: KbDocSlim["kind"]) {
  if (kind === "url") return <Globe size={14} className="text-cyan-400 shrink-0" />;
  return <FileText size={14} className="text-green-400 shrink-0" />;
}

export function KnowledgeTab({ docs, workspaceId }: Props) {
  // The server fetches typed as P02KbDoc[] but the slim API response
  // doesn't include raw_content/parsed_chunks. Cast to the slim shape.
  const slimDocs = docs as unknown as KbDocSlim[];

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Knowledge base</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            The AI reads these documents to answer customer questions.
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{ backgroundColor: "var(--bg-s2)", color: "var(--text-muted)" }}
        >
          {slimDocs.length} doc{slimDocs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Add knowledge form */}
      <AddKbForm workspaceId={workspaceId} />

      {/* Document list */}
      {slimDocs.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-10 text-center"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "rgba(34,197,94,0.08)" }}
          >
            <BookOpen size={22} className="text-green-500" />
          </div>
          <h3 className="font-semibold mb-1">Add your first KB document</h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Paste your product catalog, FAQs, pricing, or business hours above.
            The AI will answer questions directly from this content.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column headers */}
          <div
            className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-4 py-2 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Type</span>
            <span>Source / preview</span>
            <span>Chunks</span>
            <span>Added</span>
            <span>Action</span>
          </div>

          {slimDocs.map((doc) => (
            <div
              key={doc.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {kindIcon(doc.kind)}

              <div className="min-w-0">
                {doc.source_url ? (
                  <a
                    href={doc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 truncate block transition-colors"
                  >
                    {doc.source_url}
                  </a>
                ) : (
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {doc.preview}&hellip;
                  </p>
                )}
              </div>

              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--bg-s2)", color: "var(--text-muted)" }}
              >
                {doc.chunk_count} chunks
              </span>

              <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                {new Date(doc.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>

              {/* Delete — coming soon (no route yet) */}
              <span
                className="text-xs cursor-not-allowed"
                title="Delete endpoint coming in v1.1"
                style={{ color: "var(--text-muted)" }}
              >
                Delete (coming soon)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
