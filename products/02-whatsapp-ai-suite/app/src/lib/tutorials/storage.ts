// AUTO-SYNCED FROM packages/tutorials/src/storage.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:04:29.546Z
/**
 * Supabase Storage helpers for the `tutorials` bucket.
 *
 * The bucket is public-read / service-role-write.
 * Upload flow: caller requests a signed upload URL from the server,
 * client uploads directly to Supabase Storage (no proxy through Next.js),
 * client calls finalize once upload completes to record the duration.
 */

import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "tutorials";

export interface SignedUploadResult {
  /** Pre-signed URL the browser uploads to via PUT */
  upload_url: string;
  /** The public URL this file will be accessible at after upload */
  public_url: string;
  /** Storage path (bucket-relative) — e.g. "p02/uuid/en.mp4" */
  storage_path: string;
  /** Token required alongside the upload_url (already embedded in the URL) */
  token: string;
}

/**
 * Create a signed upload URL for a video or caption file.
 * The generated path is `<product_id>/<tutorial_id>/<language_code>/<filename>`.
 */
export async function getSignedUploadUrl(opts: {
  productId: string;
  tutorialId: string;
  languageCode: string;
  filename: string;
  contentType: string;
}): Promise<SignedUploadResult> {
  const safeFilename = opts.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${opts.productId}/${opts.tutorialId}/${opts.languageCode}/${safeFilename}`;

  const storage = getSupabaseAdmin().storage;
  const { data, error } = await storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error !== null || data === null) {
    throw new Error(`getSignedUploadUrl: ${error?.message ?? "unknown error"}`);
  }

  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;

  return {
    upload_url: data.signedUrl,
    public_url: publicUrl,
    storage_path: storagePath,
    token: data.token,
  };
}

/**
 * Get the public URL for a given storage path (already-uploaded file).
 * No network call needed — Supabase public bucket URLs are deterministic.
 */
export function getPublicUrl(storagePath: string): string {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/**
 * Upload a buffer (e.g. a generated VTT caption file) directly from the server.
 * Used by the auto-translate pipeline for generated caption files.
 */
export async function uploadBuffer(opts: {
  storagePath: string;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  const storage = getSupabaseAdmin().storage;
  const { error } = await storage
    .from(BUCKET)
    .upload(opts.storagePath, opts.buffer, {
      contentType: opts.contentType,
      upsert: true,
    });

  if (error !== null) {
    throw new Error(`uploadBuffer: ${error.message}`);
  }

  return getPublicUrl(opts.storagePath);
}
