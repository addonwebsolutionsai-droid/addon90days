import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sparkles, Plug, Share2, Shield, Settings as SettingsIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

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
          Every skill in SKILON is free for you. Pick where to start below.
        </p>
      </div>

      {/* Quick start grid — links into the dedicated pages.
          Previously the overview re-rendered the Connect + Invite content
          inline as anchor sections, which collided with the sidebar nav
          items and made "Connect" / "Invite" feel duplicated. */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          Quick start
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <QuickCard
            href="/skills"
            icon={Sparkles}
            iconColor="#8b5cf6"
            title="Browse 130+ skills"
            description="Indian Business · IoT · Trading · Dev Tools · 7 more"
          />
          <QuickCard
            href="/account/skills"
            icon={Sparkles}
            iconColor="#8b5cf6"
            title="My skills"
            description="Skills you've installed or favourited"
          />
          <QuickCard
            href="/account/connect"
            icon={Plug}
            iconColor="#8b5cf6"
            title="Connect Claude Desktop"
            description="Paste one MCP config block, get 130 tools"
          />
          <QuickCard
            href="/account/invite"
            icon={Share2}
            iconColor="#ec4899"
            title="Invite your team"
            description="Share your referral link"
          />
          <QuickCard
            href="/account/security"
            icon={Shield}
            iconColor="#22c55e"
            title="Security"
            description="Password, 2FA, active sessions"
          />
          <QuickCard
            href="/account/settings"
            icon={SettingsIcon}
            iconColor="#a8a8b3"
            title="Settings"
            description="Display name + email preferences"
          />
        </div>
      </section>
    </div>
  );
}

interface QuickCardProps {
  href:        string;
  icon:        typeof Sparkles;
  iconColor:   string;
  title:       string;
  description: string;
}

function QuickCard({ href, icon: Icon, iconColor, title, description }: QuickCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 rounded-xl border transition-all hover:border-violet-500/40"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Icon size={13} style={{ color: iconColor }} />
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {description}
        </div>
      </div>
      <ArrowRight size={15} className="text-violet-400 shrink-0" />
    </Link>
  );
}
