"use client";

/**
 * Edit tutorial metadata + manage videos.
 * Sections:
 *  1. Metadata form (title, feature_key, description)
 *  2. Video list (existing videos with language, default badge, delete, set-default)
 *  3. Upload panel (language dropdown + file input → signed URL → direct upload → finalize)
 *  4. Auto-translate panel (checkbox list of languages → call auto-translate endpoint)
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Tutorial {
  id: string;
  product_id: string;
  feature_key: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface TutorialVideo {
  id: string;
  language_code: string;
  video_url: string;
  thumbnail_url: string | null;
  captions_url: string | null;
  duration_sec: number | null;
  is_default: boolean;
  source_kind: string;
}

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "gu", label: "Gujarati" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "bn", label: "Bengali" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "pa", label: "Punjabi" },
] as const;

type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]["code"];

interface Props {
  tutorialId: string;
  productSegment: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditTutorialForm({ tutorialId, productSegment }: Props) {
  const router = useRouter();

  // Tutorial metadata
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [title, setTitle] = useState("");
  const [featureKey, setFeatureKey] = useState("");
  const [description, setDescription] = useState("");
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaSaved, setMetaSaved] = useState(false);

  // Videos
  const [videos, setVideos] = useState<TutorialVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  // Upload state
  const [uploadLang, setUploadLang] = useState<LanguageCode>("en");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-translate state
  const [translateLangs, setTranslateLangs] = useState<Set<LanguageCode>>(new Set());
  const [translating, setTranslating] = useState(false);
  const [translateResults, setTranslateResults] = useState<
    Array<{ language_code: string; status: string; error?: string }> | null
  >(null);

  // ---------------------------------------------------------------------------
  // Load tutorial + videos
  // ---------------------------------------------------------------------------

  const loadVideos = useCallback(async () => {
    setVideosLoading(true);
    const res = await fetch(`/api/admin/tutorials?product_id=all`);
    // We load via the individual tutorial endpoint by fetching all videos for this tutorial
    // by querying the finalize/upload-url endpoints' sibling. Actually we need a videos list.
    // The admin GET /api/admin/tutorials returns a list; for videos we call the tutorial detail.
    // Since we don't have a GET /api/admin/tutorials/[id]/videos endpoint in the spec,
    // we track locally after mutations. For the initial load, fetch from the list and match.
    // (See note below — we built getVideos in the DB lib but not a dedicated API route.
    //  For simplicity, we'll add a minimal server action inline via fetch to the
    //  existing admin tutorials route with a ?videos_for= param we can add,
    //  OR we use a dedicated route. Since the spec says to build these files, let's
    //  add a GET for videos inline here.)
    // Simpler: just add a `/api/admin/tutorials/[id]/videos` GET route (see companion file).
    const videosRes = await fetch(`/api/admin/tutorials/${tutorialId}/videos`);
    if (videosRes.ok) {
      const json = (await videosRes.json()) as { data: TutorialVideo[] };
      setVideos(json.data);
    }
    setVideosLoading(false);
  }, [tutorialId]);

  useEffect(() => {
    const loadTutorial = async () => {
      const res = await fetch(`/api/admin/tutorials?product_id=all`);
      // We need to GET a single tutorial. Adding /api/admin/tutorials/[id] GET route.
      const tRes = await fetch(`/api/admin/tutorials/${tutorialId}`);
      if (tRes.ok) {
        const json = (await tRes.json()) as { data: Tutorial };
        const t = json.data;
        setTutorial(t);
        setTitle(t.title);
        setFeatureKey(t.feature_key);
        setDescription(t.description ?? "");
      }
    };
    void loadTutorial();
    void loadVideos();
  }, [tutorialId, loadVideos]);

  // ---------------------------------------------------------------------------
  // Metadata save
  // ---------------------------------------------------------------------------

  const handleMetaSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMetaSaving(true);
    setMetaError(null);
    setMetaSaved(false);

    const res = await fetch(`/api/admin/tutorials/${tutorialId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        feature_key: featureKey.trim(),
        description: description.trim().length > 0 ? description.trim() : null,
      }),
    });

    if (res.ok) {
      setMetaSaved(true);
      setTimeout(() => setMetaSaved(false), 3000);
    } else {
      const json = (await res.json()) as { error?: { message: string } };
      setMetaError(json.error?.message ?? "Save failed");
    }
    setMetaSaving(false);
  };

  // ---------------------------------------------------------------------------
  // Video actions
  // ---------------------------------------------------------------------------

  const handleSetDefault = async (videoId: string) => {
    await fetch(`/api/admin/tutorials/${tutorialId}/videos/${videoId}/set-default`, {
      method: "POST",
    });
    void loadVideos();
  };

  const handleDeleteVideo = async (videoId: string, lang: string) => {
    if (!confirm(`Delete the ${lang} video?`)) return;
    await fetch(`/api/admin/tutorials/${tutorialId}/videos/${videoId}`, { method: "DELETE" });
    void loadVideos();
  };

  // ---------------------------------------------------------------------------
  // Video upload
  // ---------------------------------------------------------------------------

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploadFile === null) return;
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Step 1: get signed URL
      const urlRes = await fetch(`/api/admin/tutorials/${tutorialId}/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uploadFile.name,
          content_type: uploadFile.type || "video/mp4",
          language_code: uploadLang,
        }),
      });
      if (!urlRes.ok) {
        const j = (await urlRes.json()) as { error?: { message: string } };
        throw new Error(j.error?.message ?? "Failed to get upload URL");
      }
      const { data } = (await urlRes.json()) as {
        data: { upload_url: string; video_id: string; video_url_after_upload: string };
      };

      // Step 2: direct upload to Supabase Storage via PUT
      setUploadProgress(10);
      const putRes = await fetch(data.upload_url, {
        method: "PUT",
        headers: { "Content-Type": uploadFile.type || "video/mp4" },
        body: uploadFile,
      });
      if (!putRes.ok) throw new Error(`Upload failed: ${putRes.status}`);
      setUploadProgress(85);

      // Step 3: finalize — duration from the video element
      const duration = await getVideoDuration(uploadFile);
      await fetch(
        `/api/admin/tutorials/${tutorialId}/videos/${data.video_id}/finalize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration_sec: Math.round(duration) }),
        }
      );

      setUploadProgress(100);
      setUploadFile(null);
      if (fileInputRef.current !== null) fileInputRef.current.value = "";
      void loadVideos();
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Auto-translate
  // ---------------------------------------------------------------------------

  const handleAutoTranslate = async () => {
    if (translateLangs.size === 0) return;
    setTranslating(true);
    setTranslateResults(null);

    // Find the English/default video to use as source
    const sourceVideo = videos.find((v) => v.language_code === "en") ?? videos[0];
    if (sourceVideo === undefined) {
      setTranslateResults([{ language_code: "—", status: "error", error: "No source video found" }]);
      setTranslating(false);
      return;
    }

    const res = await fetch(
      `/api/admin/tutorials/${tutorialId}/videos/${sourceVideo.id}/auto-translate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_language_codes: Array.from(translateLangs) }),
      }
    );
    const json = (await res.json()) as {
      data?: { jobs: Array<{ language_code: string; status: string; error?: string }> };
      error?: { message: string };
    };
    if (res.ok && json.data !== undefined) {
      setTranslateResults(json.data.jobs);
      void loadVideos();
    } else {
      setTranslateResults([
        { language_code: "all", status: "error", error: json.error?.message ?? "Translation failed" },
      ]);
    }
    setTranslating(false);
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  if (tutorial === null) {
    return <p className="text-zinc-500 text-sm">Loading tutorial…</p>;
  }

  return (
    <div className="space-y-10 max-w-2xl">

      {/* 1. Metadata */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-2">
          Metadata
        </h2>
        <form onSubmit={(e) => { void handleMetaSave(e); }} className="space-y-4">
          {metaError !== null && (
            <p className="rounded bg-red-900/30 px-3 py-2 text-sm text-red-400">{metaError}</p>
          )}
          {metaSaved && (
            <p className="rounded bg-green-900/30 px-3 py-2 text-sm text-green-400">Saved.</p>
          )}
          <Field label="Feature Key">
            <input
              type="text"
              required
              value={featureKey}
              onChange={(e) => setFeatureKey(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Title">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </Field>
          <button
            type="submit"
            disabled={metaSaving}
            className="rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white
                       hover:bg-violet-500 disabled:opacity-50"
          >
            {metaSaving ? "Saving…" : "Save Metadata"}
          </button>
        </form>
      </section>

      {/* 2. Existing videos */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-2">
          Videos
        </h2>
        {videosLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-zinc-500">No videos yet. Upload below.</p>
        ) : (
          <div className="space-y-2">
            {videos.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-200 uppercase">{v.language_code}</span>
                  {v.is_default && (
                    <span className="rounded-full bg-violet-900/40 px-2 py-0.5 text-xs text-violet-400">
                      Default
                    </span>
                  )}
                  <span className="text-xs text-zinc-500">{v.source_kind}</span>
                  {v.duration_sec !== null && v.duration_sec > 0 && (
                    <span className="text-xs text-zinc-500">{v.duration_sec}s</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {!v.is_default && (
                    <button
                      onClick={() => void handleSetDefault(v.id)}
                      className="text-xs text-zinc-400 hover:text-violet-400"
                    >
                      Set default
                    </button>
                  )}
                  <a
                    href={v.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    View
                  </a>
                  <button
                    onClick={() => void handleDeleteVideo(v.id, v.language_code)}
                    className="text-xs text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Upload */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-2">
          Upload Video
        </h2>
        <form onSubmit={(e) => { void handleUpload(e); }} className="space-y-4">
          {uploadError !== null && (
            <p className="rounded bg-red-900/30 px-3 py-2 text-sm text-red-400">{uploadError}</p>
          )}
          <Field label="Language">
            <select
              value={uploadLang}
              onChange={(e) => setUploadLang(e.target.value as LanguageCode)}
              className={inputCls}
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Video file">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              required
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="text-sm text-zinc-300 file:mr-3 file:rounded file:border-0
                         file:bg-zinc-800 file:px-3 file:py-1.5 file:text-zinc-300
                         file:cursor-pointer hover:file:bg-zinc-700"
            />
          </Field>
          {uploadProgress !== null && (
            <div className="h-1.5 w-full rounded bg-zinc-800">
              <div
                className="h-full rounded bg-violet-500 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={uploading || uploadFile === null}
            className="rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white
                       hover:bg-violet-500 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </section>

      {/* 4. Auto-translate */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-2">
          Auto-translate Captions
        </h2>
        <p className="text-sm text-zinc-500">
          Transcribes the English video via Groq Whisper, then translates the VTT to each
          selected language via Claude Haiku 4.5. Runs synchronously — allow 20–60 s.
          Audio translation is not included (follow-up task).
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGE_OPTIONS.filter((l) => l.code !== "en").map((l) => (
            <label key={l.code} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={translateLangs.has(l.code)}
                onChange={(e) => {
                  setTranslateLangs((prev) => {
                    const next = new Set(prev);
                    if (e.target.checked) next.add(l.code);
                    else next.delete(l.code);
                    return next;
                  });
                }}
                className="rounded border-zinc-600 bg-zinc-800 text-violet-500"
              />
              <span className="text-sm text-zinc-300">{l.label}</span>
            </label>
          ))}
        </div>
        <button
          onClick={() => void handleAutoTranslate()}
          disabled={translating || translateLangs.size === 0}
          className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200
                     hover:bg-zinc-700 disabled:opacity-50"
        >
          {translating ? "Generating…" : "Generate Translations"}
        </button>
        {translateResults !== null && (
          <div className="space-y-1">
            {translateResults.map((r) => (
              <div key={r.language_code} className="flex items-center gap-2 text-sm">
                <span className="uppercase text-zinc-400 w-8">{r.language_code}</span>
                <span
                  className={
                    r.status === "done" ? "text-green-400" : "text-red-400"
                  }
                >
                  {r.status === "done" ? "Done" : `Error: ${r.error ?? "unknown"}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Back link */}
      <div>
        <button
          onClick={() => router.push(`/admin/${productSegment}/tutorials`)}
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          Back to tutorials list
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tiny shared sub-components
// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white " +
  "placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm text-zinc-300">{label}</label>
      {children}
    </div>
  );
}

async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(isFinite(video.duration) ? video.duration : 0);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}
