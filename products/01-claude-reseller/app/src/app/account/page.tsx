import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sparkles, Plug, Share2, ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { InviteFriends } from "@/components/invite-friends";
import { MCPConnect } from "@/components/mcp-connect";

export const metadata = { title: "Your account" };

export default async function AccountOverviewPage() {
  const { userId } = await auth();
  if (userId === null) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName ?? null;

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold mb-1">
          Welcome{firstName !== null ? `, ${firstName}` : ""}.
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          You have access to every skill. Connect Claude Desktop in 30 seconds, then start building.
        </p>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          Quick start
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/skills"
            className="flex items-center justify-between p-4 rounded-xl border transition-all hover:border-violet-500/40"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles size={13} className="text-violet-400" />
                <span className="font-medium text-sm">Browse 130+ skills</span>
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Indian Business · IoT · Trading · Dev Tools · 7 more
              </div>
            </div>
            <ArrowRight size={15} className="text-violet-400 shrink-0" />
          </Link>
          <Link
            href="/account/skills"
            className="flex items-center justify-between p-4 rounded-xl border transition-all hover:border-violet-500/40"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles size={13} className="text-violet-400" />
                <span className="font-medium text-sm">My skills</span>
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Skills you&apos;ve installed or favourited
              </div>
            </div>
            <ArrowRight size={15} className="text-violet-400 shrink-0" />
          </Link>
        </div>
      </section>

      {/* Connect Claude Desktop — anchor /account#connect */}
      <section
        id="connect"
        className="rounded-xl border p-6 scroll-mt-20"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
            <Plug size={16} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-0.5">Connect Claude Desktop</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Paste this block once and all 130 skills appear as tools inside Claude Desktop.
            </p>
          </div>
        </div>
        <MCPConnect />
      </section>

      {/* Invite friends — anchor /account#invite */}
      <section
        id="invite"
        className="rounded-xl border p-6 scroll-mt-20"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-pink-500/15 flex items-center justify-center shrink-0">
            <Share2 size={16} className="text-pink-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-0.5">Invite your team</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Every skill is free for the first year. The more people on your team using it, the better the catalog gets.
            </p>
          </div>
        </div>
        <InviteFriends userId={userId} />
      </section>

      {/* Open source / repo */}
      <section
        className="rounded-xl border p-5 flex items-center gap-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <Github size={18} className="text-violet-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium mb-0.5">Built in public</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Source, PRDs, and the daily runbook are public on GitHub. Fork it, study it, copy it.
          </div>
        </div>
        <a
          href="https://github.com/addonwebsolutionsai-droid/addon90days"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          View repo →
        </a>
      </section>
    </div>
  );
}
