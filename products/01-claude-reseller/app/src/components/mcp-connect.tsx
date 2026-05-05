"use client";

/**
 * MCPConnect — one-click copy of the user's MCP server config block.
 *
 * For now the MCP endpoint is the same for every user (the catalog is shared);
 * personalised tokens land when we wire per-user rate limits in v1.1. Until
 * then, this is still the highest-value action a logged-in user can take —
 * paste this block into Claude Desktop and 130 skills appear as tools.
 */

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const MCP_CONFIG = `{
  "mcpServers": {
    "addonweb-skills": {
      "type": "http",
      "url": "https://addon90days.vercel.app/api/skills/mcp"
    }
  }
}`;

export function MCPConnect() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(MCP_CONFIG);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — block is still selectable */
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-base)",
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
            ~/.claude/claude_desktop_config.json
          </span>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check size={11} /> Copied
              </>
            ) : (
              <>
                <Copy size={11} /> Copy
              </>
            )}
          </button>
        </div>
        <pre
          className="px-3 py-3 text-xs font-mono overflow-x-auto"
          style={{ color: "var(--text-primary)" }}
        >
          {MCP_CONFIG}
        </pre>
      </div>

      <ol className="text-xs space-y-1 list-decimal pl-5" style={{ color: "var(--text-secondary)" }}>
        <li>Open <span className="font-mono">claude_desktop_config.json</span> (Claude Desktop → Settings → Developer → Edit Config).</li>
        <li>Paste the block above. If you already have an <span className="font-mono">mcpServers</span> section, merge in <span className="font-mono">addonweb-skills</span>.</li>
        <li>Restart Claude Desktop. All 130 skills appear as tools.</li>
      </ol>
    </div>
  );
}
