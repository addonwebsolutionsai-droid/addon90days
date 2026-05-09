"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { CmsCategory, CmsPost, ProductScope } from "@/lib/cms/db";

const PRODUCT_SCOPES: ProductScope[] = ["global", "p01", "p02", "p03", "p04", "p05", "p06"];

const inputClass =
  "w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:border-violet-500 transition-colors " +
  "border-[var(--border-subtle)] text-[var(--text-primary)]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl border p-5 space-y-4"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium">
          {label} {required && <span className="text-red-400">*</span>}
        </span>
        {hint !== undefined && (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface PostFormProps {
  initialData?: Partial<CmsPost>;
  categories: CmsCategory[];
  mode: "create" | "edit";
  postId?: string;
}

export function PostForm({ initialData, categories, mode, postId }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [productScope, setProductScope] = useState<ProductScope>(initialData?.product_scope ?? "global");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [bodyMd, setBodyMd] = useState(initialData?.body_md ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url ?? "");
  const [tags, setTags] = useState((initialData?.tags ?? []).join(", "));
  const [keywords, setKeywords] = useState((initialData?.keywords ?? []).join(", "));

  const filteredCategories = categories.filter(
    (c) => c.kind === "blog" && (c.product_scope === productScope || c.product_scope === "global")
  );

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugManual) setSlug(slugify(val));
  }

  function parseCommaList(s: string): string[] {
    return s
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  async function submit(publishImmediately: boolean) {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        product_scope: productScope,
        category_id: categoryId !== "" ? categoryId : null,
        excerpt: excerpt.trim() !== "" ? excerpt.trim() : null,
        body_md: bodyMd,
        cover_image_url: coverImageUrl.trim() !== "" ? coverImageUrl.trim() : null,
        tags: parseCommaList(tags),
        keywords: parseCommaList(keywords),
      };

      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/admin/cms/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/cms/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);

      const createdId = (data?.data?.id as string | undefined) ?? postId;

      if (publishImmediately && createdId !== undefined) {
        const pubRes = await fetch(`/api/admin/cms/posts/${createdId}/publish`, { method: "POST" });
        if (!pubRes.ok) throw new Error("Saved but failed to publish");
      }

      startTransition(() => router.push(`/admin/cms?kind=posts`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  const isLoading = busy || isPending;

  return (
    <form onSubmit={(e) => { e.preventDefault(); void submit(false); }} className="space-y-5">
      <Section title="Content">
        <Field label="Title" required>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            maxLength={300}
            className={inputClass}
          />
        </Field>
        <Field label="Slug" required hint="URL-safe identifier, auto-generated from title">
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
            required
            maxLength={300}
            pattern="[a-z0-9-]+"
            className={`${inputClass} font-mono`}
          />
        </Field>
        <Field label="Excerpt" hint="Short summary shown in listings">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            maxLength={500}
            className={inputClass}
          />
        </Field>
        <Field label="Body (Markdown)" required hint="Supports markdown">
          <textarea
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            rows={12}
            className={`${inputClass} font-mono text-xs`}
            required
          />
        </Field>
      </Section>

      <Section title="Classification">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Product scope" required>
            <select value={productScope} onChange={(e) => { setProductScope(e.target.value as ProductScope); setCategoryId(""); }} className={inputClass}>
              {PRODUCT_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Category" hint="Optional — must be a blog category for this scope">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">None</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.product_scope})</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Tags" hint="Comma-separated, e.g. ai, automation, india">
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="tag1, tag2" />
        </Field>
        <Field label="Keywords" hint="Comma-separated — used for internal search">
          <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputClass} placeholder="keyword1, keyword2" />
        </Field>
      </Section>

      <Section title="Media">
        <Field label="Cover image URL" hint="Absolute URL to a hosted image">
          <input type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className={inputClass} placeholder="https://..." />
        </Field>
      </Section>

      {error !== null && (
        <p
          className="text-xs px-3 py-2 rounded-lg border"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.30)", color: "#fca5a5" }}
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => void submit(true)}
          disabled={isLoading || title.trim() === "" || slug.trim() === "" || bodyMd.trim() === ""}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          Save &amp; Publish
        </button>
        <button
          type="submit"
          disabled={isLoading || title.trim() === "" || slug.trim() === "" || bodyMd.trim() === ""}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          Save as Draft
        </button>
      </div>
    </form>
  );
}
