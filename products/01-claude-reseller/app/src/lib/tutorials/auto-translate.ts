/**
 * Auto-translate pipeline for tutorial videos.
 *
 * Steps:
 * 1. Fetch the English video from its URL.
 * 2. Send to Groq Whisper-large-v3-turbo to transcribe → English VTT.
 * 3. For each target language: call Claude Haiku 4.5 to translate the VTT,
 *    preserving timestamp lines exactly.
 * 4. Upload the translated VTT to Supabase Storage (`tutorials` bucket).
 * 5. Insert a `tutorial_videos` row per language with source_kind='auto_translated'.
 *
 * TTS (translated audio track) is OUT OF SCOPE for this version.
 * audio_track_url is left null. This is intentional — follow-up task.
 *
 * Running synchronously (no job queue). Founder accepts the wait for a few
 * language translations (<30 s typical for a 5-min video).
 */

import { createVideo, getVideo, type TutorialLanguageCode } from "@/lib/tutorials/db";
import { uploadBuffer } from "@/lib/tutorials/storage";

export interface TranslateJobResult {
  language_code: TutorialLanguageCode;
  status: "done" | "error";
  video_id?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Groq Whisper transcription
// ---------------------------------------------------------------------------

async function transcribeToVtt(videoUrl: string): Promise<string> {
  const groqApiKey = process.env["GROQ_API_KEY"];
  if (groqApiKey === undefined || groqApiKey.length === 0) {
    throw new Error("GROQ_API_KEY env var is not set");
  }

  // Fetch video bytes (in-memory; works for short clips; large files need streaming)
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) {
    throw new Error(`Failed to fetch video for transcription: ${videoRes.status}`);
  }
  const videoBuffer = await videoRes.arrayBuffer();
  const blob = new Blob([videoBuffer], { type: "video/mp4" });

  // Groq Whisper transcription — returns text with timestamps via response_format=vtt
  const formData = new FormData();
  formData.append("file", blob, "video.mp4");
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("response_format", "vtt");
  formData.append("language", "en");

  const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${groqApiKey}` },
    body: formData,
  });

  if (!groqRes.ok) {
    const errText = await groqRes.text();
    throw new Error(`Groq transcription failed (${groqRes.status}): ${errText}`);
  }

  // Groq returns VTT as plain text when response_format=vtt
  return groqRes.text();
}

// ---------------------------------------------------------------------------
// Claude Haiku VTT translation (direct fetch — no SDK dependency)
// ---------------------------------------------------------------------------

const LANGUAGE_NAMES: Record<TutorialLanguageCode, string> = {
  en: "English",
  hi: "Hindi",
  gu: "Gujarati",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  bn: "Bengali",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
};

async function translateVtt(
  englishVtt: string,
  targetLang: TutorialLanguageCode
): Promise<string> {
  const anthropicApiKey = process.env["ANTHROPIC_API_KEY"];
  if (anthropicApiKey === undefined || anthropicApiKey.length === 0) {
    throw new Error("ANTHROPIC_API_KEY env var is not set");
  }

  const langName = LANGUAGE_NAMES[targetLang];

  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a professional subtitle translator. Translate the following WebVTT subtitle file from English to ${langName}.

RULES:
- Keep ALL timestamp lines exactly as-is (lines matching "HH:MM:SS.mmm --> HH:MM:SS.mmm" pattern)
- Keep the "WEBVTT" header line exactly as-is
- Keep all blank separator lines exactly as-is
- Only translate the caption text lines
- Maintain natural, conversational ${langName} appropriate for software tutorials
- Do not add any explanations or markdown — output ONLY the translated VTT

VTT INPUT:
${englishVtt}`,
      },
    ],
  });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": anthropicApiKey,
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error (${res.status}): ${errText}`);
  }

  interface ClaudeContent { type: string; text?: string }
  interface ClaudeResponse { content: ClaudeContent[] }
  const json = (await res.json()) as ClaudeResponse;
  const firstContent: ClaudeContent | undefined = json.content[0];
  if (firstContent === undefined || firstContent.type !== "text" || firstContent.text === undefined) {
    throw new Error("Claude Haiku returned unexpected content type");
  }
  return firstContent.text;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

export async function autoTranslateTutorialVideo(opts: {
  sourceVideoId: string;
  tutorialId: string;
  productId: string;
  targetLanguageCodes: TutorialLanguageCode[];
}): Promise<TranslateJobResult[]> {
  const { sourceVideoId, tutorialId, productId, targetLanguageCodes } = opts;

  const sourceVideo = await getVideo(sourceVideoId);
  if (sourceVideo === null) {
    throw new Error(`autoTranslate: source video ${sourceVideoId} not found`);
  }

  // Step 1: transcribe to English VTT (once, shared across all target langs)
  let englishVtt: string;
  try {
    englishVtt = await transcribeToVtt(sourceVideo.video_url);
  } catch (err) {
    // If transcription fails, all jobs fail
    return targetLanguageCodes.map((lc) => ({
      language_code: lc,
      status: "error" as const,
      error: `Transcription failed: ${(err as Error).message}`,
    }));
  }

  // Optionally upload the English VTT back to the source video row
  // (saves re-running Whisper if caller re-uses this video)
  const enVttPath = `${productId}/${tutorialId}/${sourceVideoId}/en.vtt`;
  try {
    await uploadBuffer({
      storagePath: enVttPath,
      buffer: Buffer.from(englishVtt, "utf8"),
      contentType: "text/vtt",
    });
  } catch {
    // Non-fatal — proceed with translation even if English VTT upload fails
  }

  // Step 2-4: translate + upload + insert row — one per target language
  const results: TranslateJobResult[] = await Promise.all(
    targetLanguageCodes.map(async (langCode) => {
      try {
        const translatedVtt = await translateVtt(englishVtt, langCode);

        // Upload translated VTT to Storage
        const vttStoragePath = `${productId}/${tutorialId}/${langCode}.vtt`;
        const captionsUrl = await uploadBuffer({
          storagePath: vttStoragePath,
          buffer: Buffer.from(translatedVtt, "utf8"),
          contentType: "text/vtt",
        });

        // Insert the tutorial_videos row
        // video_url points at the SAME video file as the source — only captions differ
        const video = await createVideo({
          tutorial_id: tutorialId,
          language_code: langCode,
          video_url: sourceVideo.video_url,      // same video, translated captions
          thumbnail_url: sourceVideo.thumbnail_url ?? undefined,
          captions_url: captionsUrl,
          duration_sec: sourceVideo.duration_sec ?? undefined,
          is_default: false,
          source_kind: "auto_translated",
          generated_from_video_id: sourceVideoId,
        });

        return {
          language_code: langCode,
          status: "done" as const,
          video_id: video.id,
        };
      } catch (err) {
        return {
          language_code: langCode,
          status: "error" as const,
          error: (err as Error).message,
        };
      }
    })
  );

  return results;
}
