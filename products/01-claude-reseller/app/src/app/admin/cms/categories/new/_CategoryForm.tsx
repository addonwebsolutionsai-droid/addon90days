"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { CmsCategory, CmsKind, ProductScope } from "@/lib/cms/db";

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
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface CategoryFormProps {
  allCategories: CmsCategory[];
}

export function CategoryForm({ allCategories }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kind, setKind] = useState<CmsKind>("blog");
  const [productScope, setProductScope] = useState<ProductScope>("global");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const parentOptions = allCategories.filter(
    (c) => c.kind === kind && c.product_scope === productScope
  );

  function handleNameChange(val: string) {
    setName(val);
    if (!slugManual) setSlug(slugify(val));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cms/categories?kind=${kind}&product_scope=${productScope}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          product_scope: productScope,
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() !== "" ? description.trim() : null,
          parent_id: parentId !== "" ? parentId : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      startTransition(() => router.push("/admin/cms?kind=categories"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  const isLoading = busy || isPending;

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-5">
      <Section title="Category details">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Kind" required>
            <select value={kind} onChange={(e) => { setKind(e.target.value as CmsKind); setParentId(""); }} className={inputClass}>
              <option value="blog">Blog</option>
              <option value="faq">FAQ</option>
            </select>
          </Field>
          <Field label="Product scope" required>
            <select value={productScope} onChange={(e) => { setProductScope(e.target.value as ProductScope); setParentId(""); }} className={inputClass}>
              {PRODUCT_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            maxLength={200}
            className={inputClass}
          />
        </Field>
        <Field label="Slug" required hint="URL-safe, auto-generated from name">
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
            required
            maxLength={200}
            pattern="[a-z0-9-]+"
            className={`${inputClass} font-mono`}
          />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={500} className={inputClass} />
        </Field>
        <Field label="Parent category" hint="Filtered to same kind + scope">
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
            <option value="">None (top-level)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading || name.trim() === "" || slug.trim() === ""}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          Create category
        </button>
      </div>
    </form>
  );
}
