import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Zap, ShoppingBag, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Account Overview" };

export default async function AccountOverviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const purchasedPacks =
    (user?.publicMetadata?.["purchasedPacks"] as string[] | undefined) ?? [];

  // Each pack unlocks ~4 skills on average; free tier includes 4 base skills
  const freeSkillCount = 4;
  const paidSkillCount = purchasedPacks.length * 4;
  const totalSkills    = freeSkillCount + paidSkillCount;

  const stats = [
    { icon: Zap,         label: "Skills unlocked", value: totalSkills.toString(), href: "/account/skills"    },
    { icon: ShoppingBag, label: "Packs purchased",  value: purchasedPacks.length.toString(), href: "/account/purchases" },
    { icon: BarChart3,   label: "API calls today",  value: "—",                  href: null                 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Overview</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}. Here&apos;s your account at a glance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <div
            key={label}
            className="rounded-xl border p-5"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <Icon size={16} className="text-violet-400 mb-3" />
            <div className="text-2xl font-bold tabular-nums mb-1">{value}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
              {href && (
                <Link href={href} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5">
                  View <ArrowRight size={10} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          Quick actions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/skills"
            className="flex items-center justify-between p-4 rounded-xl border transition-all hover:border-violet-500/40"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div>
              <div className="font-medium text-sm mb-0.5">Browse Marketplace</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                130+ skills across 11 categories
              </div>
            </div>
            <ArrowRight size={15} className="text-violet-400 shrink-0" />
          </Link>
          <Link
            href="/account/billing"
            className="flex items-center justify-between p-4 rounded-xl border transition-all hover:border-violet-500/40"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div>
              <div className="font-medium text-sm mb-0.5">Upgrade to All-Access</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                ₹2,407/mo · every skill unlocked
              </div>
            </div>
            <ArrowRight size={15} className="text-violet-400 shrink-0" />
          </Link>
        </div>
      </div>

      {/* Plan status */}
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold mb-0.5">
              Current plan: <span className="text-violet-400">
                {purchasedPacks.length > 0 ? "Pack owner" : "Free"}
              </span>
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {purchasedPacks.length > 0
                ? `${purchasedPacks.length} pack${purchasedPacks.length > 1 ? "s" : ""} · ${totalSkills} skills unlocked`
                : "4 free skills · upgrade to unlock all 130+"}
            </div>
          </div>
          <Link
            href="/account/billing"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Manage billing
          </Link>
        </div>
      </div>
    </div>
  );
}
