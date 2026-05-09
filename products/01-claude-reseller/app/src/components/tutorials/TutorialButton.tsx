"use client";

/**
 * TutorialButton — "?" pill that opens an in-product video tutorial modal.
 *
 * Usage:
 *   <TutorialButton productId="p02" featureKey="p02.intent.create" />
 *
 * Behaviour:
 * - Renders a small "?" pill (Linear/Notion style).
 * - On first click, fetches /api/tutorials/by-feature (lazy — not on mount).
 * - Modal hosts an HTML5 <video> with <track> for captions.
 * - Language switcher in modal corner — picks browser language by default,
 *   falls back to default video if that language is unavailable.
 * - On modal close, POSTs watched_seconds + completed to /api/tutorials/[id]/view.
 *
 * Kept intentionally small (<250 lines).
 */

import { useState, useRef, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TutorialVideo {
  id: string;
  language_code: string;
  video_url: string;
  captions_url: string | null;
  duration_sec: number | null;
  is_default: boolean;
}

interface TutorialData {
  id: string;
  title: string;
  description: string | null;
}

interface ApiResponse {
  data?: { tutorial: TutorialData; video: TutorialVideo };
  error?: { message: string };
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English", hi: "Hindi", gu: "Gujarati", ta: "Tamil",
  te: "Telugu", mr: "Marathi", bn: "Bengali", kn: "Kannada",
  ml: "Malayalam", pa: "Punjabi",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  productId: string;
  featureKey: string;
  /** Optional override label. Defaults to "?" */
  label?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TutorialButton({ productId, featureKey, label = "?" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorial, setTutorial] = useState<TutorialData | null>(null);
  const [video, setVideo] = useState<TutorialVideo | null>(null);
  const [activeLang, setActiveLang] = useState<string>("en");

  // For analytics
  const videoRef = useRef<HTMLVideoElement>(null);
  const openedAtRef = useRef<number>(0);

  // Preferred language from browser (split returns at least one element, but TS doesn't know)
  const browserLang: string =
    typeof navigator !== "undefined"
      ? (navigator.language.split("-")[0] ?? "en")
      : "en";

  // ---------------------------------------------------------------------------
  // Fetch (lazy — only on first open)
  // ---------------------------------------------------------------------------

  const fetchTutorial = useCallback(async (lang: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        product_id: productId,
        feature_key: featureKey,
        lang,
      });
      const res = await fetch(`/api/tutorials/by-feature?${params.toString()}`);
      const json = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(json.error?.message ?? "Tutorial not found");
      if (json.data !== undefined) {
        setTutorial(json.data.tutorial);
        setVideo(json.data.video);
        setActiveLang(json.data.video.language_code);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [productId, featureKey]);

  const switchLanguage = useCallback(async (lang: string) => {
    setActiveLang(lang);
    await fetchTutorial(lang);
    // Reset video to start when switching language
    if (videoRef.current !== null) {
      videoRef.current.currentTime = 0;
    }
  }, [fetchTutorial]);

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  const handleOpen = () => {
    setOpen(true);
    openedAtRef.current = Date.now();
    // Fetch on first open only
    if (tutorial === null) {
      void fetchTutorial(browserLang);
    }
  };

  const handleClose = useCallback(() => {
    setOpen(false);

    // Post analytics (fire-and-forget)
    if (tutorial !== null && video !== null) {
      const currentTime = videoRef.current?.currentTime ?? 0;
      const watchedSeconds = Math.round(currentTime);
      const completed =
        video.duration_sec !== null &&
        currentTime >= video.duration_sec * 0.9;

      void fetch(`/api/tutorials/${tutorial.id}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_code: activeLang,
          watched_seconds: watchedSeconds,
          completed,
        }),
      }).catch(() => {
        // Non-fatal — analytics should never surface to user
      });
    }
  }, [tutorial, video, activeLang]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* The "?" pill */}
      <button
        onClick={handleOpen}
        aria-label="How does this work?"
        title="How does this work?"
        className="inline-flex items-center justify-center h-5 w-5 rounded-full
                   border border-zinc-600 bg-zinc-800 text-xs text-zinc-400
                   hover:border-violet-500 hover:text-violet-400 hover:bg-zinc-700
                   transition-colors cursor-pointer select-none"
      >
        {label}
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tutorial?.title ?? "Tutorial"}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-2xl rounded-xl border border-zinc-800
                          bg-zinc-950 shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-semibold text-white">
                  {tutorial?.title ?? "Tutorial"}
                </h2>
                {tutorial?.description !== null && tutorial?.description !== undefined && (
                  <p className="mt-0.5 text-sm text-zinc-400">{tutorial.description}</p>
                )}
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="ml-4 mt-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-5 space-y-4">
              {loading && (
                <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
                  Loading tutorial…
                </div>
              )}
              {error !== null && (
                <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
                  {error}
                </div>
              )}
              {!loading && video !== null && (
                <>
                  <video
                    ref={videoRef}
                    key={video.id}
                    controls
                    autoPlay
                    className="w-full rounded-lg bg-black aspect-video"
                    src={video.video_url}
                  >
                    {video.captions_url !== null && (
                      <track
                        kind="captions"
                        src={video.captions_url}
                        srcLang={activeLang}
                        label={LANGUAGE_LABELS[activeLang] ?? activeLang}
                        default
                      />
                    )}
                  </video>

                  {/* Language switcher */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500">Language:</span>
                    {Object.entries(LANGUAGE_LABELS).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => void switchLanguage(code)}
                        className={`rounded px-2.5 py-1 text-xs transition-colors ${
                          activeLang === code
                            ? "bg-violet-700 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
