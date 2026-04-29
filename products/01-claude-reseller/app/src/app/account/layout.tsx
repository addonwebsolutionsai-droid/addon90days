import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Zap, LayoutDashboard, Sparkles, ShoppingBag, CreditCard, Shield, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/account",           icon: LayoutDashboard, label: "Overview"  },
  { href: "/account/skills",    icon: Sparkles,        label: "My Skills"  },
  { href: "/account/purchases", icon: ShoppingBag,     label: "Purchases"  },
  { href: "/account/billing",   icon: CreditCard,      label: "Billing"    },
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
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 border-r"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2 px-5 h-14 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <Link href="/" className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Claude Toolkit
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-0.5" aria-label="Account navigation">
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
              <Zap size={11} className="text-white" />
            </div>
            <span className="font-semibold text-sm">Claude Toolkit</span>
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
