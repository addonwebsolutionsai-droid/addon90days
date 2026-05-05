import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Infinity as InfinityIcon, LayoutDashboard, Sparkles, Plug, Share2, Shield, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/account",           icon: LayoutDashboard, label: "Overview"  },
  { href: "/account/skills",    icon: Sparkles,        label: "My Skills"  },
  { href: "/account#connect",   icon: Plug,            label: "Connect"    },
  { href: "/account#invite",    icon: Share2,          label: "Invite"     },
  { href: "/account/security",  icon: Shield,          label: "Security"   },
  { href: "/account/settings",  icon: Settings,        label: "Settings"   },
] as const;

type AccountLayoutProps = {
  children: React.ReactNode;
};

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Sidebar — sticky so the brand + nav + user button stay in view
          while the main content scrolls. Previously the aside scrolled
          along with main, so on /account#invite the user lost the rail
          mid-scroll. Each section inside also gets the subtle scrollbar
          if its content overflows. */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 border-r sticky top-0 h-screen"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        {/* Brand — entire group is the home link */}
        <Link
          href="/"
          aria-label="SKILON — AI Skills. Limitless Future."
          className="flex items-center gap-2 px-5 h-14 border-b transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
        >
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <InfinityIcon size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm tracking-wide">SKILON</span>
        </Link>

        {/* Nav items — flex-1 takes remaining height, overflow-y-auto kicks
            in only on short viewports (rare; we have 6 nav items). */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto subtle-scrollbar min-h-0" aria-label="Account navigation">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-violet-500/10 hover:text-violet-400"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User area */}
        <div
          className="px-4 py-4 border-t flex items-center gap-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <UserButton afterSignOutUrl="/" />
          <span className="text-xs truncate flex-1" style={{ color: "var(--text-muted)" }}>
            My account
          </span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 h-14 border-b"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <InfinityIcon size={12} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-sm tracking-wide">SKILON</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>

        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
