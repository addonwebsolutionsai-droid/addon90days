"use client";

/**
 * CopyCodeButton — copies code to clipboard from a skill step code block.
 * Client component because it uses the Clipboard API and manages copy state.
 */

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyCodeButtonProps {
  code: string;
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (non-secure context or denied permission).
      // Silently fail — the user can still manually select the code.
    }
  }

  return (
    <button
      onClick={() => void handleCopy()}
      aria-label={copied ? "Copied!" : "Copy code"}
      className="flex items-center gap-1.5 text-[10px] font-medium text-white/40 hover:text-white transition-colors"
    >
      {copied ? (
        <>
          <Check size={12} className="text-green-400" />
          <span className="text-green-400">Copied</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          Copy
        </>
      )}
    </button>
  );
}
