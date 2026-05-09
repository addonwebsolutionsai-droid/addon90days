import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { listPosts, listFaqs, listCategories } from "@/lib/cms/db";
import Link from "next/link";
import { BookText, Plus, ToggleLeft, ToggleRight, Pencil } from "lucide-react";

export const metadata = { title: "CMS · Admin · SKILON" };

const PRODUCT_SCOPES = ["global", "p01", "p02", "p03", "p04", "p05", "p06"] as const;

interface PageProps {
  searchParams: Promise<{ kind?: string; product_scope?: string; status?: string; q?: string }>;
}

export default async function CmsHubPage({ searchParams }: PageProps) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    if (guard.reason === "unauthenticated") redirect("/sign-in?redirect_url=/admin/cms");
    redirect("/");
  }

  const sp = await searchParams;
  const activeKind = sp.kind ?? "posts";
  const scopeFilter = sp.product_scope ?? "";
  const statusFilter = sp.status ?? "";
  const query = sp.q ?? "";

  const [posts, faqs, blogCats, faqCats] = await Promise.all([
    activeKind === "posts"
      ? listPosts({
          productScope: scopeFilter !== "" ? (scopeFilter as never) : undefined,
          status: statusFilter !== "" ? (statusFilter as never) : undefined,
          query: query !== "" ? query : undefined,
          limit: 50,
        })
      : Promise.resolve([]),
    activeKind === "faqs"
      ? listFaqs({
          productScope: scopeFilter !== "" ? (scopeFilter as never) : undefined,
          query: query !== "" ? query : undefined,
          limit: 50,
        })
      : Promise.resolve([]),
    activeKind === "categories"
      ? listCategories({ kind: "blog" })
      : Promise.resolve([]),
    activeKind === "categories"
      ? listCategories({ kind: "faq" })
      : Promise.resolve([]),
  ]);

  const tabClass = (key: string) =>
    `px-4 py-2 text-sm rounded-lg transition-colors ${
      activeKind === key
        ? "bg-violet-600 text-white font-medium"
        : "hover:bg-white/5 text-[var(--text-secondary)]"
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookText size={20} className="text-violet-400" />
          <h1 className="text-xl font-semibold">CMS</h1>
        </div>
        {activeKind === "posts" && (
          <Link
            href="/admin/cms/posts/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} /> New Post
          </Link>
        )}
        {activeKind === "faqs" && (
          <Link
            href="/admin/cms/faqs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} /> New FAQ
          </Link>
        )}
        {activeKind === "categories" && (
          <Link
            href="/admin/cms/categories/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} /> New Category
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
        {(["posts", "faqs", "categories"] as const).map((k) => (
          <Link key={k} href={`/admin/cms?kind=${k}`} className={tabClass(k)}>
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </Link>
        ))}
      </div>

      {/* Filters */}
      {activeKind !== "categories" && (
        <form method="GET" className="flex flex-wrap gap-3">
          <input type="hidden" name="kind" value={activeKind} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search..."
            className="px-3 py-1.5 text-sm rounded-lg border bg-transparent focus:outline-none focus:border-violet-500"
            style={{ borderColor: "var(--border-subtle)" }}
          />
          <select
            name="product_scope"
            defaultValue={scopeFilter}
            className="px-3 py-1.5 text-sm rounded-lg border bg-transparent focus:outline-none"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <option value="">All products</option>
            {PRODUCT_SCOPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {activeKind === "posts" && (
            <select
              name="status"
              defaultValue={statusFilter}
              className="px-3 py-1.5 text-sm rounded-lg border bg-transparent focus:outline-none"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          )}
          <button
            type="submit"
            className="px-3 py-1.5 text-sm rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            Filter
          </button>
        </form>
      )}

      {/* Posts table */}
      {activeKind === "posts" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg-surface)" }}>
              <tr className="text-left">
                {["Title", "Scope", "Category", "Status", "Active", "Published", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {posts.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>No posts yet.</td></tr>
              )}
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{p.title}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{p.product_scope}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{p.category_id ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === "published" ? "bg-green-500/15 text-green-400" :
                      p.status === "archived" ? "bg-zinc-500/15 text-zinc-400" :
                      "bg-yellow-500/15 text-yellow-400"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.is_active ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} className="text-zinc-500" />}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {p.published_at !== null ? new Date(p.published_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/cms/posts/${p.id}/edit`} className="inline-flex items-center gap-1 text-xs hover:text-violet-400 transition-colors" style={{ color: "var(--text-muted)" }}>
                      <Pencil size={12} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FAQs table */}
      {activeKind === "faqs" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg-surface)" }}>
              <tr className="text-left">
                {["Question", "Scope", "Order", "Active", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {faqs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>No FAQs yet.</td></tr>
              )}
              {faqs.map((f) => (
                <tr key={f.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{f.question}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{f.product_scope}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{f.sort_order}</td>
                  <td className="px-4 py-3">
                    {f.is_active ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} className="text-zinc-500" />}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/cms/faqs/${f.id}/edit`} className="inline-flex items-center gap-1 text-xs hover:text-violet-400 transition-colors" style={{ color: "var(--text-muted)" }}>
                      <Pencil size={12} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories */}
      {activeKind === "categories" && (
        <div className="space-y-6">
          {(["blog", "faq"] as const).map((kind) => {
            const cats = kind === "blog" ? blogCats : faqCats;
            return (
              <div key={kind} className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {kind === "blog" ? "Blog categories" : "FAQ categories"}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: "var(--bg-surface)" }}>
                    <tr className="text-left">
                      {["Name", "Slug", "Scope", "Parent", "Active", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                    {cats.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>No categories.</td></tr>
                    )}
                    {cats.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{c.slug}</td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{c.product_scope}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{c.parent_id ?? "—"}</td>
                        <td className="px-4 py-3">
                          {c.is_active ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} className="text-zinc-500" />}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>id: {c.id.slice(0, 8)}…</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
