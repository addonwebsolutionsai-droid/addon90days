// AUTO-SYNCED FROM packages/tutorials/src/db.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:20:52.327Z
/**
 * Tutorials database helpers — tutorials, tutorial_videos, tutorial_views.
 *
 * All reads/writes use the service-role client (bypasses RLS).
 * Untyped wrapper pattern — mirrors lib/cms/db.ts.
 * Types are intentionally loose; tutorials_* tables are not yet in
 * database.types.ts (would need a regeneration from Supabase).
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Untyped table accessor
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tbl(tableName: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(tableName);
}

function assertNoError(error: unknown, context: string): void {
  if (error !== null && error !== undefined) {
    throw new Error(`${context}: ${(error as { message: string }).message}`);
  }
}

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type TutorialProductId = "p01" | "p02" | "p03" | "p04" | "p05" | "p06" | "global";

export type TutorialLanguageCode =
  | "en" | "hi" | "gu" | "ta" | "te" | "mr" | "bn" | "kn" | "ml" | "pa";

export type TutorialSourceKind = "original" | "auto_translated" | "human_translated";

export interface Tutorial {
  id: string;
  product_id: TutorialProductId;
  feature_key: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TutorialVideo {
  id: string;
  tutorial_id: string;
  language_code: TutorialLanguageCode;
  video_url: string;
  thumbnail_url: string | null;
  captions_url: string | null;
  audio_track_url: string | null;
  duration_sec: number | null;
  is_default: boolean;
  source_kind: TutorialSourceKind;
  generated_from_video_id: string | null;
  created_at: string;
}

export interface TutorialView {
  id: string;
  tutorial_id: string;
  language_code: string;
  clerk_user_id: string | null;
  watched_seconds: number;
  completed: boolean;
  viewed_at: string;
}

// ---------------------------------------------------------------------------
// Tutorials CRUD
// ---------------------------------------------------------------------------

export async function listTutorials(opts: {
  productId?: TutorialProductId;
  isActiveOnly?: boolean;
  search?: string;
}): Promise<Tutorial[]> {
  let q = tbl("tutorials")
    .select("*")
    .order("sort_order")
    .order("created_at");

  if (opts.productId !== undefined) q = q.eq("product_id", opts.productId);
  if (opts.isActiveOnly === true) q = q.eq("is_active", true);
  if (opts.search !== undefined && opts.search.trim().length > 0) {
    const term = `%${opts.search.trim()}%`;
    q = q.or(`title.ilike.${term},feature_key.ilike.${term},description.ilike.${term}`);
  }

  const { data, error } = await q;
  assertNoError(error, "listTutorials");
  return (data ?? []) as Tutorial[];
}

/**
 * Get tutorial by UUID or by (product_id, feature_key).
 * If `idOrFeatureKey` looks like a UUID we do the id lookup first.
 */
export async function getTutorial(
  idOrFeatureKey: string,
  productId?: TutorialProductId
): Promise<Tutorial | null> {
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRe.test(idOrFeatureKey)) {
    const { data, error } = await tbl("tutorials")
      .select("*")
      .eq("id", idOrFeatureKey)
      .maybeSingle();
    assertNoError(error, "getTutorial/byId");
    return (data ?? null) as Tutorial | null;
  }

  // Lookup by feature_key — productId is required in this path
  if (productId === undefined) {
    throw new Error("getTutorial: productId required when looking up by feature_key");
  }
  const { data, error } = await tbl("tutorials")
    .select("*")
    .eq("product_id", productId)
    .eq("feature_key", idOrFeatureKey)
    .maybeSingle();
  assertNoError(error, "getTutorial/byFeatureKey");
  return (data ?? null) as Tutorial | null;
}

export async function createTutorial(input: {
  product_id: TutorialProductId;
  feature_key: string;
  title: string;
  description?: string;
}): Promise<Tutorial> {
  const { data, error } = await tbl("tutorials")
    .insert({
      product_id: input.product_id,
      feature_key: input.feature_key,
      title: input.title,
      description: input.description ?? null,
    })
    .select("*")
    .single();
  assertNoError(error, "createTutorial");
  return data as Tutorial;
}

export async function updateTutorial(
  id: string,
  patch: Partial<Pick<Tutorial, "title" | "description" | "sort_order" | "is_active" | "feature_key">>
): Promise<Tutorial> {
  const { data, error } = await tbl("tutorials")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  assertNoError(error, "updateTutorial");
  return data as Tutorial;
}

export async function toggleTutorialActive(id: string): Promise<Tutorial> {
  const existing = await getTutorial(id);
  if (existing === null) throw new Error(`toggleTutorialActive: tutorial ${id} not found`);
  return updateTutorial(id, { is_active: !existing.is_active });
}

export async function deleteTutorial(id: string): Promise<void> {
  // Cascade to tutorial_videos is handled by the DB FK ON DELETE CASCADE.
  const { error } = await tbl("tutorials").delete().eq("id", id);
  assertNoError(error, "deleteTutorial");
}

// ---------------------------------------------------------------------------
// Tutorial Videos CRUD
// ---------------------------------------------------------------------------

export async function listVideos(tutorialId: string): Promise<TutorialVideo[]> {
  const { data, error } = await tbl("tutorial_videos")
    .select("*")
    .eq("tutorial_id", tutorialId)
    // Default video first, then by language for stable ordering
    .order("is_default", { ascending: false })
    .order("language_code");
  assertNoError(error, "listVideos");
  return (data ?? []) as TutorialVideo[];
}

export async function getVideo(id: string): Promise<TutorialVideo | null> {
  const { data, error } = await tbl("tutorial_videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  assertNoError(error, "getVideo");
  return (data ?? null) as TutorialVideo | null;
}

export async function createVideo(input: {
  tutorial_id: string;
  language_code: TutorialLanguageCode;
  video_url: string;
  thumbnail_url?: string;
  captions_url?: string;
  audio_track_url?: string;
  duration_sec?: number;
  is_default?: boolean;
  source_kind?: TutorialSourceKind;
  generated_from_video_id?: string;
}): Promise<TutorialVideo> {
  const { data, error } = await tbl("tutorial_videos")
    .insert({
      tutorial_id: input.tutorial_id,
      language_code: input.language_code,
      video_url: input.video_url,
      thumbnail_url: input.thumbnail_url ?? null,
      captions_url: input.captions_url ?? null,
      audio_track_url: input.audio_track_url ?? null,
      duration_sec: input.duration_sec ?? null,
      is_default: input.is_default ?? false,
      source_kind: input.source_kind ?? "original",
      generated_from_video_id: input.generated_from_video_id ?? null,
    })
    .select("*")
    .single();
  assertNoError(error, "createVideo");
  return data as TutorialVideo;
}

/**
 * Set the default video for a tutorial. Clears the previous default atomically
 * using a two-step update (Supabase JS client does not support UPDATE...RETURNING
 * with a subquery, so we do: clear all → set one).
 * Both operations run sequentially — acceptable because admin ops are infrequent.
 */
export async function setDefaultVideo(tutorialId: string, videoId: string): Promise<void> {
  // Step 1: clear all defaults for this tutorial
  const { error: clearError } = await tbl("tutorial_videos")
    .update({ is_default: false })
    .eq("tutorial_id", tutorialId);
  assertNoError(clearError, "setDefaultVideo/clear");

  // Step 2: set the new default
  const { error: setError } = await tbl("tutorial_videos")
    .update({ is_default: true })
    .eq("id", videoId)
    .eq("tutorial_id", tutorialId);
  assertNoError(setError, "setDefaultVideo/set");
}

export async function updateVideo(
  id: string,
  patch: Partial<Pick<TutorialVideo, "duration_sec" | "thumbnail_url" | "captions_url" | "audio_track_url">>
): Promise<TutorialVideo> {
  const { data, error } = await tbl("tutorial_videos")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  assertNoError(error, "updateVideo");
  return data as TutorialVideo;
}

export async function deleteVideo(id: string): Promise<void> {
  const { error } = await tbl("tutorial_videos").delete().eq("id", id);
  assertNoError(error, "deleteVideo");
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export async function recordView(input: {
  tutorial_id: string;
  language_code: string;
  clerk_user_id?: string;
  watched_seconds: number;
  completed: boolean;
}): Promise<void> {
  const { error } = await tbl("tutorial_views").insert({
    tutorial_id: input.tutorial_id,
    language_code: input.language_code,
    clerk_user_id: input.clerk_user_id ?? null,
    watched_seconds: input.watched_seconds,
    completed: input.completed,
  });
  // Non-fatal: analytics should never break the caller
  if (error !== null && error !== undefined) {
    console.error(`[tutorials] recordView failed: ${(error as { message: string }).message}`);
  }
}
