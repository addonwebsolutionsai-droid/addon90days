// AUTO-SYNCED FROM packages/cms/src/db.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-11T09:05:13.413Z
/**
 * CMS database helpers — cms_categories, cms_posts, cms_faqs.
 *
 * All reads/writes use the service-role client (bypasses RLS).
 * Callers are responsible for scoping queries by product_scope.
 *
 * Types are intentionally loose (untyped wrapper pattern, same as lib/p02/db.ts):
 * the Database generic only knows P01 tables. cms_* tables are accessed via
 * an untyped helper until we regenerate database.types.ts.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductScope = "global" | "p01" | "p02" | "p03" | "p04" | "p05" | "p06";
export type CmsKind = "blog" | "faq";
export type PostStatus = "draft" | "published" | "archived";

export interface CmsCategory {
  id: string;
  parent_id: string | null;
  product_scope: ProductScope;
  kind: CmsKind;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsPost {
  id: string;
  slug: string;
  product_scope: ProductScope;
  category_id: string | null;
  title: string;
  excerpt: string | null;
  body_md: string;
  cover_image_url: string | null;
  tags: string[];
  keywords: string[];
  status: PostStatus;
  author_clerk_user_id: string;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsFaq {
  id: string;
  product_scope: ProductScope;
  category_id: string | null;
  question: string;
  answer_md: string;
  tags: string[];
  keywords: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsSearchResult {
  kind: "post" | "faq";
  id: string;
  title: string;       // post title OR faq question
  excerpt: string;     // post excerpt OR faq answer snippet
  product_scope: ProductScope;
  slug: string | null; // posts only
}

// ---------------------------------------------------------------------------
// Untyped table accessor (mirrors lib/p02/db.ts pattern)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cmsTable(tableName: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(tableName);
}

function assertNoError(error: unknown, context: string): void {
  if (error !== null && error !== undefined) {
    throw new Error(`${context}: ${(error as Error).message}`);
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function listCategories(opts: {
  kind: CmsKind;
  productScope?: ProductScope;
}): Promise<CmsCategory[]> {
  let q = cmsTable("cms_categories").select("*").eq("kind", opts.kind).order("sort_order");
  if (opts.productScope !== undefined) {
    q = q.eq("product_scope", opts.productScope);
  }
  const { data, error } = await q;
  assertNoError(error, "listCategories");
  return (data ?? []) as CmsCategory[];
}

export async function getCategory(id: string): Promise<CmsCategory | null> {
  const { data, error } = await cmsTable("cms_categories").select("*").eq("id", id).single();
  assertNoError(error, "getCategory");
  return (data ?? null) as CmsCategory | null;
}

export async function createCategory(input: {
  product_scope: ProductScope;
  kind: CmsKind;
  slug: string;
  name: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
}): Promise<CmsCategory> {
  const { data, error } = await cmsTable("cms_categories")
    .insert({
      product_scope: input.product_scope,
      kind: input.kind,
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      parent_id: input.parent_id ?? null,
      sort_order: input.sort_order ?? 0,
    })
    .select("*")
    .single();
  assertNoError(error, "createCategory");
  return data as CmsCategory;
}

export async function updateCategory(
  id: string,
  patch: Partial<Omit<CmsCategory, "id" | "created_at" | "updated_at">>
): Promise<CmsCategory> {
  const { data, error } = await cmsTable("cms_categories")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  assertNoError(error, "updateCategory");
  return data as CmsCategory;
}

export async function toggleCategoryActive(id: string): Promise<CmsCategory> {
  const existing = await getCategory(id);
  if (existing === null) throw new Error(`toggleCategoryActive: category ${id} not found`);
  return updateCategory(id, { is_active: !existing.is_active });
}

export async function deleteCategory(id: string): Promise<void> {
  // Guard: refuse if any post references this category
  const { count: postCount, error: postErr } = await cmsTable("cms_posts")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  assertNoError(postErr, "deleteCategory/checkPosts");
  if ((postCount ?? 0) > 0) {
    throw new Error("Cannot delete category: it has posts referencing it.");
  }

  const { count: faqCount, error: faqErr } = await cmsTable("cms_faqs")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  assertNoError(faqErr, "deleteCategory/checkFaqs");
  if ((faqCount ?? 0) > 0) {
    throw new Error("Cannot delete category: it has FAQs referencing it.");
  }

  const { error } = await cmsTable("cms_categories").delete().eq("id", id);
  assertNoError(error, "deleteCategory");
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function listPosts(opts: {
  productScope?: ProductScope;
  categoryId?: string;
  status?: PostStatus;
  query?: string;
  limit?: number;
}): Promise<CmsPost[]> {
  let q = cmsTable("cms_posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (opts.productScope !== undefined) q = q.eq("product_scope", opts.productScope);
  if (opts.categoryId !== undefined) q = q.eq("category_id", opts.categoryId);
  if (opts.status !== undefined) q = q.eq("status", opts.status);
  if (opts.query !== undefined && opts.query.trim().length > 0) {
    const term = `%${opts.query.trim()}%`;
    q = q.or(`title.ilike.${term},excerpt.ilike.${term}`);
  }
  if (opts.limit !== undefined) q = q.limit(opts.limit);

  const { data, error } = await q;
  assertNoError(error, "listPosts");
  return (data ?? []) as CmsPost[];
}

export async function getPost(slugOrId: string): Promise<CmsPost | null> {
  // Try by slug first, fall back to id
  const bySlug = await cmsTable("cms_posts").select("*").eq("slug", slugOrId).maybeSingle();
  if (bySlug.error === null && bySlug.data !== null) return bySlug.data as CmsPost;

  const { data, error } = await cmsTable("cms_posts").select("*").eq("id", slugOrId).maybeSingle();
  assertNoError(error, "getPost");
  return (data ?? null) as CmsPost | null;
}

export async function createPost(input: {
  slug: string;
  product_scope: ProductScope;
  title: string;
  body_md: string;
  author_clerk_user_id: string;
  category_id?: string;
  excerpt?: string;
  cover_image_url?: string;
  tags?: string[];
  keywords?: string[];
}): Promise<CmsPost> {
  const { data, error } = await cmsTable("cms_posts")
    .insert({
      slug: input.slug,
      product_scope: input.product_scope,
      title: input.title,
      body_md: input.body_md,
      author_clerk_user_id: input.author_clerk_user_id,
      category_id: input.category_id ?? null,
      excerpt: input.excerpt ?? null,
      cover_image_url: input.cover_image_url ?? null,
      tags: input.tags ?? [],
      keywords: input.keywords ?? [],
      status: "draft" as PostStatus,
    })
    .select("*")
    .single();
  assertNoError(error, "createPost");
  return data as CmsPost;
}

export async function updatePost(
  id: string,
  patch: Partial<Omit<CmsPost, "id" | "created_at" | "updated_at">>
): Promise<CmsPost> {
  const { data, error } = await cmsTable("cms_posts")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  assertNoError(error, "updatePost");
  return data as CmsPost;
}

export async function publishPost(id: string): Promise<CmsPost> {
  return updatePost(id, { status: "published", published_at: new Date().toISOString() });
}

export async function archivePost(id: string): Promise<CmsPost> {
  return updatePost(id, { status: "archived" });
}

export async function togglePostActive(id: string): Promise<CmsPost> {
  const { data, error } = await cmsTable("cms_posts")
    .select("is_active")
    .eq("id", id)
    .single();
  assertNoError(error, "togglePostActive/read");
  return updatePost(id, { is_active: !(data as { is_active: boolean }).is_active });
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function listFaqs(opts: {
  productScope?: ProductScope;
  categoryId?: string;
  query?: string;
  limit?: number;
}): Promise<CmsFaq[]> {
  let q = cmsTable("cms_faqs").select("*").order("sort_order");

  if (opts.productScope !== undefined) q = q.eq("product_scope", opts.productScope);
  if (opts.categoryId !== undefined) q = q.eq("category_id", opts.categoryId);
  if (opts.query !== undefined && opts.query.trim().length > 0) {
    const term = `%${opts.query.trim()}%`;
    q = q.or(`question.ilike.${term},answer_md.ilike.${term}`);
  }
  if (opts.limit !== undefined) q = q.limit(opts.limit);

  const { data, error } = await q;
  assertNoError(error, "listFaqs");
  return (data ?? []) as CmsFaq[];
}

export async function getFaq(id: string): Promise<CmsFaq | null> {
  const { data, error } = await cmsTable("cms_faqs").select("*").eq("id", id).maybeSingle();
  assertNoError(error, "getFaq");
  return (data ?? null) as CmsFaq | null;
}

export async function createFaq(input: {
  product_scope: ProductScope;
  question: string;
  answer_md: string;
  category_id?: string;
  tags?: string[];
  keywords?: string[];
  sort_order?: number;
}): Promise<CmsFaq> {
  const { data, error } = await cmsTable("cms_faqs")
    .insert({
      product_scope: input.product_scope,
      question: input.question,
      answer_md: input.answer_md,
      category_id: input.category_id ?? null,
      tags: input.tags ?? [],
      keywords: input.keywords ?? [],
      sort_order: input.sort_order ?? 0,
    })
    .select("*")
    .single();
  assertNoError(error, "createFaq");
  return data as CmsFaq;
}

export async function updateFaq(
  id: string,
  patch: Partial<Omit<CmsFaq, "id" | "created_at" | "updated_at">>
): Promise<CmsFaq> {
  const { data, error } = await cmsTable("cms_faqs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  assertNoError(error, "updateFaq");
  return data as CmsFaq;
}

export async function toggleFaqActive(id: string): Promise<CmsFaq> {
  const existing = await getFaq(id);
  if (existing === null) throw new Error(`toggleFaqActive: faq ${id} not found`);
  return updateFaq(id, { is_active: !existing.is_active });
}

export async function reorderFaqs(idsInOrder: string[]): Promise<void> {
  await Promise.all(
    idsInOrder.map((id, idx) =>
      cmsTable("cms_faqs").update({ sort_order: idx }).eq("id", id)
    )
  );
}

// ---------------------------------------------------------------------------
// Search across CMS
// ---------------------------------------------------------------------------

export async function searchAcrossCms(
  query: string,
  productScope?: ProductScope
): Promise<CmsSearchResult[]> {
  const term = `%${query.trim()}%`;

  let postsQ = cmsTable("cms_posts")
    .select("id, slug, product_scope, title, excerpt, tags, keywords")
    .or(`title.ilike.${term},body_md.ilike.${term},excerpt.ilike.${term}`)
    .eq("status", "published")
    .limit(20);

  let faqsQ = cmsTable("cms_faqs")
    .select("id, product_scope, question, answer_md, tags, keywords")
    .or(`question.ilike.${term},answer_md.ilike.${term}`)
    .eq("is_active", true)
    .limit(20);

  if (productScope !== undefined) {
    postsQ = postsQ.eq("product_scope", productScope);
    faqsQ = faqsQ.eq("product_scope", productScope);
  }

  const [postsRes, faqsRes] = await Promise.all([postsQ, faqsQ]);
  assertNoError(postsRes.error, "searchAcrossCms/posts");
  assertNoError(faqsRes.error, "searchAcrossCms/faqs");

  const postResults: CmsSearchResult[] = ((postsRes.data ?? []) as CmsPost[]).map((p) => ({
    kind: "post" as const,
    id: p.id,
    title: p.title,
    excerpt: p.excerpt ?? p.body_md.slice(0, 140),
    product_scope: p.product_scope,
    slug: p.slug,
  }));

  const faqResults: CmsSearchResult[] = ((faqsRes.data ?? []) as CmsFaq[]).map((f) => ({
    kind: "faq" as const,
    id: f.id,
    title: f.question,
    excerpt: f.answer_md.slice(0, 140),
    product_scope: f.product_scope,
    slug: null,
  }));

  return [...postResults, ...faqResults];
}
