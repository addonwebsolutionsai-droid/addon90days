"use client";

/**
 * ConditionalChatWidget — renders the marketplace support chatbot only
 * on Claude Toolkit pages. Hidden on per-product brand pages so the
 * toolkit's bot doesn't answer questions on /chatbase, /taxpilot, etc.
 *
 * Each per-product brand can ship its own product-specific support
 * widget later. For exit-strategy purposes, products must look
 * standalone — a chatbot that says "AddonWeb Support — install skills
 * and fix Claude Desktop config" on a ChatBase page is brand pollution.
 */

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/chat-widget";

const CHAT_EXCLUDED_PREFIXES = [
  "/sign-in",
  "/sign-up",
  // Per-product brands — each is its own product
  "/chatbase",
  "/taxpilot",
  "/tableflow",
  "/connectone",
  "/machineguard",
];

export function ConditionalChatWidget() {
  const pathname = usePathname();
  const excluded = CHAT_EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));
  if (excluded) return null;
  return <ChatWidget />;
}
