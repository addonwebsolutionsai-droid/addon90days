"use client";

/**
 * Shared create-tutorial form.
 * Used by all 6 /admin/<product>/tutorials/new/page.tsx routes.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  productSegment: string;
}

export function TutorialForm({ productId, productSegment }: Props) {
  const router = useRouter();
  const [featureKey, setFeatureKey] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/tutorials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          feature_key: featureKey.trim(),
          title: title.trim(),
          description: description.trim().length > 0 ? description.trim() : undefined,
        }),
      });
      const json = (await res.json()) as { data?: { id: string }; error?: { message: string } };
      if (!res.ok) throw new Error(json.error?.message ?? "Request failed");
      // Navigate directly to the edit page so founder can upload the video right away
      router.push(productSegment.length > 0 ? `/admin/${productSegment}/tutorials/${json.data!.id}/edit` : `/admin/tutorials/${json.data!.id}/edit`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5 max-w-xl">
      {error !== null && (
        <p className="rounded bg-red-900/30 px-4 py-2 text-sm text-red-400">{error}</p>
      )}

      <div className="space-y-1">
        <label className="block text-sm text-zinc-300" htmlFor="feature_key">
          Feature Key <span className="text-zinc-500">(e.g. p02.intent.create)</span>
        </label>
        <input
          id="feature_key"
          type="text"
          required
          value={featureKey}
          onChange={(e) => setFeatureKey(e.target.value)}
          placeholder="p02.intent.create"
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white
                     font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <p className="text-xs text-zinc-500">
          Unique within this product. This is what the user-facing widget looks up.
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-zinc-300" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="How to create an intent"
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white
                     placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-zinc-300" htmlFor="description">
          Description <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description shown below the title in the widget."
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white
                     placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-violet-600 px-5 py-2 text-sm font-medium text-white
                     hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating…" : "Create Tutorial"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border border-zinc-700 px-5 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
