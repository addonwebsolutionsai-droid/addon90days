import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Purchases" };

const PACK_META: Record<string, { name: string; price: string; skills: number }> = {
  "iot-developer-pack":           { name: "IoT Developer Pack",           price: "₹4,067", skills: 4 },
  "developer-productivity-pack":  { name: "Developer Productivity Pack",  price: "₹2,407", skills: 4 },
  "trading-pack":                 { name: "Trading & Finance Pack",       price: "₹5,999", skills: 4 },
};

export default async function PurchasesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const purchasedPacks =
    (user?.publicMetadata?.["purchasedPacks"] as string[] | undefined) ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Purchases</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {purchasedPacks.length === 0
            ? "No purchases yet."
            : `${purchasedPacks.length} pack${purchasedPacks.length > 1 ? "s" : ""} purchased.`}
        </p>
      </div>

      {purchasedPacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag size={32} className="text-violet-400/40 mb-4" />
          <p className="font-medium mb-1">No purchases yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Browse the marketplace and pick up a skill pack.
          </p>
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Browse skills <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b text-xs uppercase tracking-wider"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-s2)", color: "var(--text-muted)" }}
              >
                <th className="px-5 py-3 text-left font-medium">Pack</th>
                <th className="px-5 py-3 text-left font-medium hidden sm:table-cell">Skills</th>
                <th className="px-5 py-3 text-left font-medium">Amount</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "var(--bg-surface)" }}>
              {purchasedPacks.map((packId, idx) => {
                const meta = PACK_META[packId] ?? { name: packId, price: "—", skills: 0 };
                return (
                  <tr
                    key={packId}
                    className="border-b last:border-0"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium">{meta.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Order #{String(idx + 1).padStart(4, "0")}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                      {meta.skills} skills
                    </td>
                    <td className="px-5 py-4 font-medium">{meta.price}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/15 text-green-500">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
