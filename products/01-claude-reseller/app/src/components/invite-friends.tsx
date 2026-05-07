"use client";

/**
 * InviteFriends — copy-able referral link + one-click share to X / LinkedIn /
 * WhatsApp / Reddit. Click-tracking is via the `?ref=<userId>` query param —
 * we'll read it on signup once the referral table lands (v1.1).
 *
 * For launch: the link contains the user's Clerk ID so when their friend
 * signs up, we can backfill the referral attribution from /api/agents logs
 * even without a dedicated referrals table.
 */

import { useState } from "react";
import { Copy, Check, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { SITE_BASE_URL } from "@/lib/site-config";

const APP_ORIGIN = SITE_BASE_URL;

interface InviteFriendsProps {
  userId: string;
  /** Live catalog label like "140+" — server passes it down so share copy tracks the catalog. */
  skillCountLabel?: string;
}

export function InviteFriends({ userId, skillCountLabel }: InviteFriendsProps) {
  const [copied, setCopied] = useState(false);
  const countText = skillCountLabel ?? "100+";
  const shareCopy = `I'm building with SKILON — ${countText} free Claude skills, MCP servers, and agent bundles. 1-line install. Try it:`;
  const link = `${APP_ORIGIN}/?ref=${encodeURIComponent(userId)}`;
  const xText = encodeURIComponent(`${shareCopy} ${link}`);
  const liUrl = encodeURIComponent(link);
  const waText = encodeURIComponent(`${shareCopy} ${link}`);
  const redditUrl = encodeURIComponent(link);
  const redditTitle = encodeURIComponent(`SKILON — ${countText} free Claude skills, MCP & agents (by AddonWeb)`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — degrade silently. The link is selectable.
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{
          backgroundColor: "var(--bg-base)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <input
          type="text"
          readOnly
          value={link}
          aria-label="Your invite link"
          className="flex-1 bg-transparent text-xs font-mono truncate focus:outline-none"
          style={{ color: "var(--text-secondary)" }}
          onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
        />
        <button
          type="button"
          onClick={copyLink}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} /> Copied
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={`https://twitter.com/intent/tweet?text=${xText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
        >
          <Twitter size={12} /> X / Twitter
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

      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        Each install we credit you for during the first year unlocks an early-builder badge on your skill cards.
      </p>
    </div>
  );
}
