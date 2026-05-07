import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Share2 } from "lucide-react";
import { InviteFriends } from "@/components/invite-friends";
import { getSkillCountLabel } from "@/lib/catalog-stats";

export const metadata = { title: "Invite your team" };

export default async function InvitePage() {
  const { userId } = await auth();
  if (userId === null) redirect("/sign-in?redirect_url=/account/invite");
  const skillCountLabel = await getSkillCountLabel();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Invite your team</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Every skill is free for the first year. The more people on your team using SKILON, the better the catalog gets.
        </p>
      </div>

      <section
        className="rounded-xl border p-6"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-pink-500/15 flex items-center justify-center shrink-0">
            <Share2 size={16} className="text-pink-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-0.5">Your referral link</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Each install we credit you for during the first year unlocks an early-builder badge on your skill cards.
            </p>
          </div>
        </div>
        <InviteFriends userId={userId} skillCountLabel={skillCountLabel} />
      </section>
    </div>
  );
}
