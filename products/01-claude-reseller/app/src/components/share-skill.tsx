"use client";

/**
 * ShareSkill — compact share row on skill detail pages. Copy link + share to
 * X, LinkedIn, WhatsApp, Reddit. The share text already includes the skill
 * title and tagline so a click-share has good signal to the network.
 */

import { useState } from "react";
import { Copy, Check, Twitter, Linkedin, MessageCircle } from "lucide-react";

import { SITE_BASE_URL } from "@/lib/site-config";

const APP_ORIGIN = SITE_BASE_URL;

interface ShareSkillProps {
  slug: string;
  title: string;
  tagline: string;
}

export function ShareSkill({ slug, title, tagline }: ShareSkillProps) {
  const [copied, setCopied] = useState(false);
  const url = `${APP_ORIGIN}/skills/${slug}`;
  const message = `${title} — ${tagline}. Free Claude skill from AddonWeb. ${url}`;
  const xText = encodeURIComponent(message);
  const liUrl = encodeURIComponent(url);
  const waText = encodeURIComponent(message);
  const redditUrl = encodeURIComponent(url);
  const redditTitle = encodeURIComponent(`${title} — ${tagline}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div
      className="flex items-center gap-2 flex-wrap rounded-xl border px-4 py-3"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <span className="text-xs font-medium mr-1" style={{ color: "var(--text-muted)" }}>
        Share:
      </span>
      <button
        type="button"
        onClick={copy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        {copied ? (
          <>
            <Check size={12} className="text-green-500" /> Copied
          </>
        ) : (
          <>
            <Copy size={12} /> Copy link
          </>
        )}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${xText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        <Twitter size={12} /> X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${liUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        <Linkedin size={12} /> LinkedIn
      </a>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        <MessageCircle size={12} /> WhatsApp
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${redditUrl}&title=${redditTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        Reddit
      </a>
    </div>
  );
}
