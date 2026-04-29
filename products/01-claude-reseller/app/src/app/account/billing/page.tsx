import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Billing" };

const ALL_ACCESS_FEATURES = [
  "All 130+ skills, including future additions",
  "API access with your unique key",
  "Priority email support",
  "Early access to new skill categories",
  "Cancel anytime — no lock-in",
];

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const purchasedPacks =
    (user?.publicMetadata?.["purchasedPacks"] as string[] | undefined) ?? [];
  const isAllAccess =
    (user?.publicMetadata?.["plan"] as string | undefined) === "all-access";

  const currentPlan = isAllAccess
    ? "All-Access"
    : purchasedPacks.length > 0
    ? "Pack owner"
    : "Free";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Billing</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your plan and payment details.
        </p>
      </div>

      {/* Current plan card */}
      <div
        className="rounded-xl border p-6 mb-6"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={15} className="text-violet-400" />
          <span className="text-sm font-semibold">Current plan</span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="text-xl font-bold mb-0.5">{currentPlan}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isAllAccess
                ? "Renews monthly"
                : purchasedPacks.length > 0
                ? `${purchasedPacks.length} pack${purchasedPacks.length > 1 ? "s" : ""} · one-time purchase`
                : "4 free skills · no payment required"}
            </div>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: isAllAccess ? "rgba(139,92,246,0.15)" : "rgba(161,161,170,0.15)",
              color: isAllAccess ? "#a78bfa" : "var(--text-muted)",
            }}
          >
            {isAllAccess ? "Active" : "Free tier"}
          </span>
        </div>
      </div>

      {/* Payment method placeholder */}
      {isAllAccess && (
        <div
          className="rounded-xl border p-5 mb-6"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <div className="text-sm font-semibold mb-3">Payment method</div>
          <div
            className="flex items-center gap-3 p-3 rounded-lg border"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-s2)" }}
          >
            <div
              className="w-10 h-7 rounded flex items-center justify-center text-[10px] font-bold border"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              VISA
            </div>
            <div>
              <div className="text-sm">•••• •••• •••• 4242</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Expires 12/28
              </div>
            </div>
            <button
              className="ml-auto text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Upgrade CTA — shown only when not on All-Access */}
      {!isAllAccess && (
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-transparent p-6">
          <div className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-2">
            Recommended
          </div>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold mb-1">All-Access — ₹2,407/mo</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Unlock every skill in the marketplace. New skills added daily.
              </p>
            </div>
          </div>
          <ul className="space-y-2 mb-6">
            {ALL_ACCESS_FEATURES.map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <CheckCircle size={14} className="text-green-500 shrink-0" />
                {feat}
              </li>
            ))}
          </ul>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-colors"
          >
            Start All-Access <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
