/**
 * P02 ChatBase — knowledge base helpers.
 *
 * MVP: keyword-match retrieval (no vector embeddings yet).
 * v1.1: swap in Qdrant vector search without changing the caller interface.
 */

import type { KbChunk, P02KbDoc } from "./types";

const CHUNK_SIZE = 400; // chars per chunk
const CHUNK_OVERLAP = 80;
const TOP_K = 5;

/** Split raw text into overlapping chunks for storage. */
export function chunkText(text: string): KbChunk[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (normalized.length === 0) return [];

  const chunks: KbChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    chunks.push({ index, text: normalized.slice(start, end).trim() });
    index++;
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

/** Retrieve top-K chunks from all KB docs most relevant to the query.
 *  MVP: simple keyword overlap scoring. */
export function retrieveTopChunks(docs: P02KbDoc[], query: string): KbChunk[] {
  const queryTokens = tokenize(query);
  if (queryTokens.size === 0) return [];

  const scored: Array<{ chunk: KbChunk; score: number }> = [];

  for (const doc of docs) {
    for (const chunk of doc.parsed_chunks as KbChunk[]) {
      const chunkTokens = tokenize(chunk.text);
      const score = jaccardScore(queryTokens, chunkTokens);
      if (score > 0) scored.push({ chunk, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, TOP_K).map((s) => s.chunk);
}

/** Build a context string to inject into the LLM system prompt. */
export function buildKbContext(chunks: KbChunk[]): string {
  if (chunks.length === 0) return "";
  const parts = chunks.map((c, i) => `[KB${i + 1}] ${c.text}`);
  return `--- Knowledge Base ---\n${parts.join("\n\n")}\n--- End KB ---`;
}

// ---------------------------------------------------------------------------
// URL scraping — minimal fetch-based implementation (no playwright needed for MVP)
// ---------------------------------------------------------------------------

export async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "ChatBase-KBBot/1.0" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`Scrape failed: HTTP ${res.status} for ${url}`);

  const html = await res.text();
  return stripHtml(html);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9ऀ-ॿ\s]/g, " ") // keep Latin + Devanagari
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );
}

function jaccardScore(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function stripHtml(html: string): string {
  // Remove scripts, styles, comments
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, " ")
    .trim();

  // Limit to 10k chars for storage
  if (text.length > 10_000) text = text.slice(0, 10_000);
  return text;
}
