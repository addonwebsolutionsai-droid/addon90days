"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Archive, ToggleLeft, ToggleRight } from "lucide-react";
import type { CmsCategory, CmsPost } from "@/lib/cms/db";
import { PostForm } from "../../_PostForm";

interface EditPostFormProps {
  post: CmsPost;
  categories: CmsCategory[];
}

export function EditPostFormActions({ post, categories }: EditPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(endpoint: string, method = "POST") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error ?? `HTTP ${res.status}`);
      }
      startTransition(() => router.push("/admin/cms?kind=posts"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  const isLoading = busy || isPending;

  return (
    <div className="space-y-6 max-w-2xl">
      <PostForm initialData={post} categories={categories} mode="edit" postId={post.id} />

      {/* Danger-zone actions */}
      <section
        className="rounded-xl border p-5 space-y-3"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "rgba(239,68,68,0.3)" }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-red-400">Actions</h2>
        <div className="flex flex-wrap gap-2">
          {post.status !== "archived" && (
            <button
              onClick={() => void action(`/api/admin/cms/posts/${post.id}/archive`)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-colors hover:bg-white/5 disabled:opacity-50"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
              Archive
            </button>
          )}
          <button
            onClick={() => void action(`/api/admin/cms/posts/${post.id}/toggle`)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-colors hover:bg-white/5 disabled:opacity-50"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            {isLoading
              ? <Loader2 size={13} className="animate-spin" />
              : post.is_active ? <ToggleRight size={13} className="text-green-400" /> : <ToggleLeft size={13} className="text-zinc-400" />}
            {post.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
        {error !== null && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </section>
    </div>
  );
}
