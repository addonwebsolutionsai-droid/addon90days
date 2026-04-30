"use client";

/**
 * InstallMethods — beginner-friendly install card for the skill detail page.
 *
 * Three tabs, each written for a layman user with step-by-step instructions:
 *
 *   1. ONE-COMMAND   (recommended) — copy the npx line, paste into Terminal,
 *                                    skill is installed. Zero file management.
 *   2. CLAUDE DESKTOP (MCP)        — paste a JSON block into Claude Desktop's
 *                                    config once → ALL 130 skills auto-available.
 *                                    No per-skill install ever again.
 *   3. MANUAL         (advanced)   — download the .md file, move it into
 *                                    .claude/skills/ folder. For users who want
 *                                    to read the file before running it.
 *
 * Copy buttons everywhere. Animation on copy. Plain-English instructions.
 */

import { useState } from "react";
import { Check, Copy, Terminal, Layers, Download, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Method = "cli" | "mcp" | "manual";

interface InstallMethodsProps {
  slug: string;
  isSignedIn: boolean;
}

interface CopyBlockProps {
  text: string;
  label?: string;
}

function CopyBlock({ text, label }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (older browsers) — silently no-op
    }
  }

  return (
    <div className="relative group">
      {label && (
        <div
          className="text-[10px] uppercase tracking-wider font-semibold mb-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </div>
      )}
      <pre
        className="rounded-lg border p-3 pr-12 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre"
        style={{
          backgroundColor: "#0f0f12",
          borderColor: "var(--border-subtle)",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <code>{text}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className={cn(
          "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium",
          "transition-all border",
          copied
            ? "bg-green-500/20 border-green-500/40 text-green-400"
            : "bg-violet-600/20 border-violet-500/30 text-violet-300 hover:bg-violet-600/30",
          label ? "top-7" : "top-2"
        )}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          backgroundColor: "var(--bg-s2)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {n}
      </span>
      <div className="flex-1 min-w-0 text-sm leading-relaxed pt-0.5" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </div>
  );
}

export function InstallMethods({ slug, isSignedIn }: InstallMethodsProps) {
  const [active, setActive] = useState<Method>("cli");

  const cliCommand = `npx addonweb-claude-skills install ${slug}`;
  const mcpUrl = `https://addon90days.vercel.app/api/skills/mcp`;
  // Native HTTP transport — newest Claude Desktop supports this directly.
  const mcpJsonHttp = `{
  "mcpServers": {
    "addonweb-skills": {
      "type": "http",
      "url": "${mcpUrl}"
    }
  }
}`;
  // mcp-remote proxy fallback — works on all Claude Desktop versions and Claude Code.
  const mcpJsonProxy = `{
  "mcpServers": {
    "addonweb-skills": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${mcpUrl}"]
    }
  }
}`;

  const downloadHref = isSignedIn
    ? `/api/skills/${slug}/install`
    : `/sign-in?redirect_url=/skills/${slug}`;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <h2 className="text-base font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
          Install this skill
        </h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Pick the method that fits your setup. All three are free during beta.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <TabButton active={active === "cli"} onClick={() => setActive("cli")} icon={<Terminal size={13} />} label="One Command" badge="Recommended" />
        <TabButton active={active === "mcp"} onClick={() => setActive("mcp")} icon={<Layers size={13} />} label="Claude Desktop" />
        <TabButton active={active === "manual"} onClick={() => setActive("manual")} icon={<Download size={13} />} label="Manual" />
      </div>

      {/* Tab content */}
      <div className="p-5">
        {active === "cli" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong>Best for:</strong> anyone using <em>Claude Code</em> (Anthropic&apos;s
              terminal app). This installs the skill as a slash command in your project.
            </p>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 mb-2">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                <strong className="text-amber-400">Don&apos;t have Claude Code yet?</strong>{" "}
                Install it first (one-time, 30 seconds):
              </p>
              <CopyBlock text={`curl -fsSL https://claude.ai/install.sh | bash\necho 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc\nsource ~/.zshrc`} />
            </div>

            <div className="space-y-3">
              <Step n={1}>
                Open <strong>Terminal</strong> (macOS / Linux) or <strong>PowerShell</strong> (Windows).
                Move into the project folder where you want this skill available:
                <CopyBlock text="cd path/to/your-project" />
              </Step>

              <Step n={2}>
                Paste this command and press <kbd className="px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: "var(--border)" }}>Enter</kbd>:
                <CopyBlock text={cliCommand} />
                <span className="text-xs block mt-1" style={{ color: "var(--text-muted)" }}>
                  This writes <code className="font-mono">.claude/commands/{slug}.md</code> in your project.
                </span>
              </Step>

              <Step n={3}>
                Now <strong>start Claude Code</strong>. Type this in the same terminal:
                <CopyBlock text="claude" />
                <span className="text-xs block mt-1" style={{ color: "var(--text-muted)" }}>
                  You&apos;ll see a <strong>new prompt</strong> appear (it looks like{" "}
                  <code className="font-mono">{">"}</code> or <code className="font-mono">{"?"}</code>).
                  That&apos;s Claude Code itself — you&apos;ve left the regular shell.
                </span>
              </Step>

              <Step n={4}>
                <strong>Inside that new prompt</strong>, type the slash command:
                <CopyBlock text={`/${slug}`} />
                <span className="text-xs block mt-1" style={{ color: "var(--text-muted)" }}>
                  Claude will execute the skill. (If you typed{" "}
                  <code className="font-mono">/{slug}</code> in your regular zsh/bash terminal and got{" "}
                  <code className="font-mono text-red-400">no such file or directory</code> — that&apos;s
                  why; slash commands work <strong>only inside Claude Code</strong>.)
                </span>
              </Step>
            </div>

            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 mt-4">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                <strong className="text-violet-400">First time using npx?</strong> No setup needed — npx comes
                with Node.js. If you don&apos;t have Node.js, install it from{" "}
                <a
                  href="https://nodejs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  nodejs.org
                </a>{" "}
                (one-time, takes 60 seconds).
              </p>
            </div>
          </div>
        )}

        {active === "mcp" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong>Best for:</strong> users of <em>Claude Desktop</em> (the chat app).
              Set this up <strong>once</strong> and <strong>all 130 skills</strong> become available
              automatically — no need to install each one separately.
            </p>

            <div className="space-y-3">
              <Step n={1}>
                Open <strong>Claude Desktop</strong>. Go to{" "}
                <span className="font-mono text-xs">Settings → Developer → Edit Config</span>.
                A file called <span className="font-mono text-xs">claude_desktop_config.json</span> will open.
              </Step>

              <Step n={2}>
                <strong>Try this first</strong> — if the existing file already has
                an <span className="font-mono text-xs">mcpServers</span> section, just add the{" "}
                <span className="font-mono text-xs">addonweb-skills</span> entry inside it.
                The whole file should be a single valid JSON object — don&apos;t paste the snippet
                twice.
                <CopyBlock label="claude_desktop_config.json (recommended)" text={mcpJsonHttp} />
                <span className="text-xs block mt-1" style={{ color: "var(--text-muted)" }}>
                  Uses Claude Desktop&apos;s built-in HTTP transport — no extra software needed.
                </span>
              </Step>

              <Step n={3}>
                Save the file (<kbd className="px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: "var(--border)" }}>Cmd+S</kbd> /
                {" "}<kbd className="px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: "var(--border)" }}>Ctrl+S</kbd>) and{" "}
                <strong>fully quit</strong> Claude Desktop (right-click tray icon → Quit, not just
                close the window). Reopen it.
              </Step>

              <Step n={4}>
                In any chat, type <span className="font-mono text-xs">@</span> or
                {" "}<span className="font-mono text-xs">/</span> — you&apos;ll see{" "}
                <span className="font-mono text-xs">addonweb-skills</span> listed with all 130 tools.
                Pick <span className="font-mono text-xs">{slug}</span> or any other skill, fill in
                the inputs Claude asks for, and hit send.
              </Step>
            </div>

            <details className="rounded-lg border p-3 mt-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-s2)" }}>
              <summary className="text-xs font-medium cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                Older Claude Desktop (or Claude Code)? Use this config instead ↓
              </summary>
              <p className="text-xs mt-2 mb-2" style={{ color: "var(--text-muted)" }}>
                If the HTTP config above shows &quot;server failed to start&quot;, your Claude Desktop
                version may not support the <code className="font-mono">type: http</code> field yet.
                Use this proxy-based config — works on every version and on Claude Code:
              </p>
              <CopyBlock label="claude_desktop_config.json (proxy via npx)" text={mcpJsonProxy} />
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                Requires Node.js installed locally (download from{" "}
                <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">nodejs.org</a>).
                The first launch downloads <code className="font-mono">mcp-remote</code> via npx automatically.
              </p>
            </details>

            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 mt-4">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                <strong className="text-cyan-400">Why this option is the best:</strong> set up{" "}
                <em>once</em>, all 130 skills (and every new one we ship) instantly available.
                No per-skill install ever.
              </p>
            </div>
          </div>
        )}

        {active === "manual" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong>Best for:</strong> users who want to read the skill file before running it,
              or who can&apos;t install Node.js. {!isSignedIn && <span className="text-amber-400">You&apos;ll be asked to sign in first.</span>}
            </p>

            <div className="space-y-3">
              <Step n={1}>
                Click the button below. Your browser will download a file named{" "}
                <span className="font-mono text-xs">{slug}.md</span> to your Downloads folder.
                <Link
                  href={downloadHref}
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                >
                  <Download size={14} />
                  {isSignedIn ? `Download ${slug}.md` : "Sign in to download"}
                  <ChevronRight size={13} />
                </Link>
              </Step>

              <Step n={2}>
                Open Terminal (macOS / Linux) and move the file into{" "}
                <code className="font-mono text-xs">.claude/commands/</code> inside your project folder:
                <CopyBlock label="macOS / Linux" text={`mkdir -p .claude/commands && mv ~/Downloads/${slug}.md .claude/commands/`} />
                <span className="text-xs block mt-2 mb-1" style={{ color: "var(--text-muted)" }}>
                  On Windows (PowerShell):
                </span>
                <CopyBlock label="Windows" text={`New-Item -ItemType Directory -Force .claude/commands; Move-Item $HOME/Downloads/${slug}.md .claude/commands/`} />
              </Step>

              <Step n={3}>
                Start Claude Code in that same folder:
                <CopyBlock text="claude" />
                <span className="text-xs block mt-1" style={{ color: "var(--text-muted)" }}>
                  Wait for Claude Code&apos;s new prompt to appear (looks like{" "}
                  <code className="font-mono">{">"}</code> or <code className="font-mono">{"?"}</code>).
                </span>
              </Step>

              <Step n={4}>
                <strong>Inside Claude Code&apos;s prompt</strong> (not in zsh/bash), type:
                <CopyBlock text={`/${slug}`} />
                <span className="text-xs block mt-1" style={{ color: "var(--text-muted)" }}>
                  If <code className="font-mono">claude: command not found</code> — see install
                  command in the &quot;One Command&quot; tab above.
                </span>
              </Step>
            </div>

            <div className="rounded-lg border p-3 mt-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-s2)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                The downloaded file includes inline instructions at the top. If you get stuck,
                open it in any text editor and follow the comments.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-all",
        active ? "border-b-2 border-violet-500" : "border-b-2 border-transparent hover:bg-white/5"
      )}
      style={{
        color: active ? "var(--text-primary)" : "var(--text-muted)",
      }}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold bg-green-500/15 text-green-500">
          {badge}
        </span>
      )}
    </button>
  );
}
