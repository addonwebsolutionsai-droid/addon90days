/**
 * /admin/chatbase/intents/[intentId]/edit
 *
 * Edit a workspace-specific intent. Pre-filled with existing values.
 * Also exposes a Delete button (only enabled for non-global intents).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { EditIntentForm } from "./_EditIntentForm";
import type { P02Intent } from "@/lib/p02/types";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02table(name: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(name);
}

interface RouteContext { params: Promise<{ intentId: string }> }

export default async function EditIntentPage(ctx: RouteContext) {
  const guard = await requireAdmin();
  if (!guard.ok) redirect("/sign-in");

  const { intentId } = await ctx.params;
  const { data } = await p02table("p02_intents").select("*").eq("id", intentId).maybeSingle();
  if (data === null) notFound();

  const intent = data as P02Intent;

  // Load workspace name if this is a custom intent
  let workspaceName: string | null = null;
  if (intent.workspace_id !== null) {
    const { data: ws } = await p02table("p02_workspaces")
      .select("business_name")
      .eq("id", intent.workspace_id)
      .maybeSingle();
    workspaceName = (ws as { business_name: string } | null)?.business_name ?? null;
  }

  const backHref = intent.workspace_id !== null
    ? `/admin/chatbase/workspaces/${intent.workspace_id}`
    : `/admin/chatbase`;

  return (
    <div className="space-y-5 max-w-2xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back
      </Link>

      <header>
        <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "var(--text-muted)" }}>
          Edit intent
        </p>
        <h1 className="text-2xl font-bold font-mono">{intent.intent_key}</h1>
        {workspaceName !== null && (
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Workspace: {workspaceName}
          </p>
        )}
        {intent.workspace_id === null && (
          <span
            className="inline-block mt-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
            style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#c4b5fd" }}
          >
            global default
          </span>
        )}
      </header>

      <EditIntentForm intent={intent} backHref={backHref} />
    </div>
  );
}
