/**
 * /chatbase — server-rendered metadata wrapper for the (client) marketing page.
 *
 * Why this layout exists: the marketing page is "use client" (it owns the
 * waitlist form state) and client components can't export `metadata`. Without
 * this layout the page inherits the root layout's "SKILON …" title, which
 * breaks per-product brand isolation (founder rule: each product is a
 * transferable asset → no SKILON suffix on sister products).
 *
 * Uses `title.absolute` to bypass the root layout's `template: "%s | SKILON"`.
 */

import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/lib/site-config";

const TITLE = "ChatBase — WhatsApp AI for Indian SMBs";
const DESC =
  "AI agent on WhatsApp Business for Indian SMBs. Handles customer queries, quotes, orders, invoices, follow-ups — 24/7. No missed leads. Free during beta.";
const URL = `${SITE_BASE_URL}/chatbase`;

export const metadata: Metadata = {
  title:       { absolute: TITLE },
  description: DESC,
  alternates:  { canonical: URL },
  openGraph: {
    type:        "website",
    title:       TITLE,
    description: DESC,
    url:         URL,
    siteName:    "ChatBase",
  },
  twitter: {
    card:        "summary_large_image",
    title:       TITLE,
    description: DESC,
  },
};

export default function ChatbaseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
