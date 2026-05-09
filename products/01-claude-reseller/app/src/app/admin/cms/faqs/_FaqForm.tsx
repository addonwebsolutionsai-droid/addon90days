"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { CmsCategory, CmsFaq, ProductScope } from "@/lib/cms/db";

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

interface FaqFormProps {
  initialData?: Partial<CmsFaq>;
  categories: CmsCategory[];
  mode: "create" | "edit";
  faqId?: string;
}

export function FaqForm({ initialData, categories, mode, faqId }: FaqFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [question, setQuestion] = useState(initialData?.question ?? "");
  const [answerMd, setAnswerMd] = useState(initialData?.answer_md ?? "");
  const [productScope, setProductScope] = useState<ProductScope>(initialData?.product_scope ?? "global");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [tags, setTags] = useState((initialData?.tags ?? []).join(", "));
  const [keywords, setKeywords] = useState((initialData?.keywords ?? []).join(", "));
  const [sortOrder, setSortOrder] = useState(String(initialData?.sort_order ?? 0));

  const filteredCategories = categories.filter(
    (c) => c.kind === "faq" && (c.product_scope === productScope || c.product_scope === "global")
  );

  function parseCommaList(s: string): string[] {
    return s.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        question: question.trim(),
        answer_md: answerMd,
        product_scope: productScope,
        category_id: categoryId !== "" ? categoryId : null,
        tags: parseCommaList(tags),
        keywords: parseCommaList(keywords),
        sort_order: Number(sortOrder),
      };

      const res = mode === "create"
        ? await fetch("/api/admin/cms/faqs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/cms/faqs/${faqId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      startTransition(() => router.push("/admin/cms?kind=faqs"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBusy(false);
    }
  }

  const isLoading = busy || isPending;

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-5">
      <Section title="FAQ content">
        <Field label="Question" required>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            maxLength={500}
            className={inputClass}
          />
        </Field>
        <Field label="Answer (Markdown)" required hint="Supports markdown">
          <textarea
            value={answerMd}
            onChange={(e) => setAnswerMd(e.target.value)}
            rows={8}
            required
            className={`${inputClass} font-mono text-xs`}
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
          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">None</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.product_scope})</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Tags" hint="Comma-separated">
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="tag1, tag2" />
        </Field>
        <Field label="Keywords" hint="Comma-separated — used for search">
          <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputClass} placeholder="keyword1, keyword2" />
        </Field>
        <Field label="Sort order" hint="Lower = appears first">
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} min={0} className={inputClass} />
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
          disabled={isLoading || question.trim() === "" || answerMd.trim() === ""}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {mode === "create" ? "Create FAQ" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
