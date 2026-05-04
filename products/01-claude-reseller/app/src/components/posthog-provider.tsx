"use client";

/**
 * PostHogProvider — initializes PostHog client-side analytics on first render.
 *
 * Gated on NEXT_PUBLIC_POSTHOG_KEY: if the env var is unset (e.g. local dev,
 * preview deploy without the key), the provider becomes a no-op pass-through.
 * This means production traffic gets tracked once the key is added on Vercel,
 * with zero code change.
 *
 * Captures:
 *   - autopcapture: clicks, form submits, pageleaves
 *   - pageviews via the usePathname hook (App Router doesn't fire 'pageview'
 *     events on client-side navigation by default)
 *   - identifies signed-in users by their Clerk user ID + email
 */

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

let initialized = false;

function initPostHog(): void {
  if (initialized) return;
  if (typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (key === undefined || key.length === 0) return;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: false,
  });
  initialized = true;
}

/**
 * Mount this once near the top of the tree (inside ClerkProvider so useUser
 * works, and inside <Suspense> because useSearchParams suspends in App Router).
 * It renders nothing — it only fires PostHog events as a side effect.
 */
export function PostHogProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (typeof window === "undefined") return;
    const url = `${pathname}${searchParams.toString().length > 0 ? `?${searchParams.toString()}` : ""}`;
    posthog.capture("$pageview", { $current_url: window.location.origin + url });
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!initialized) return;
    if (isSignedIn !== true || user === null || user === undefined) return;
    const email = user.primaryEmailAddress?.emailAddress;
    posthog.identify(user.id, {
      email,
      created_at: user.createdAt?.toISOString(),
    });
  }, [isSignedIn, user]);

  return null;
}
