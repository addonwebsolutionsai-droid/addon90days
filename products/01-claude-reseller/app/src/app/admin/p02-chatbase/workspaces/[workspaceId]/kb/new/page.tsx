/**
 * /admin/p02-chatbase/workspaces/[workspaceId]/kb/new
 *
 * Server shell + client form for adding a KB document.
 * Tabs: Text | URL (PDF disabled with tooltip).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { KbDocForm } from "./_KbDocForm";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02table(name: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(name);
}

interface RouteContext { params: Promise<{ workspaceId: string }> }

export default async function NewKbDocPage(ctx: RouteContext) {
  const guard = await requireAdmin();
  if (!guard.ok) redirect("/sign-in");

  const { workspaceId } = await ctx.params;
  const { data: ws } = await p02table("p02_workspaces")
    .select("id, business_name")
    .eq("id", workspaceId)
    .maybeSingle();

  if (ws === null) notFound();
  const workspace = ws as { id: string; business_name: string };

  return (
    <div className="space-y-5 max-w-2xl">
      <Link
        href={`/admin/p02-chatbase/workspaces/${workspaceId}`}
        className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-violet-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to {workspace.business_name}
      </Link>

      <header>
        <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "var(--text-muted)" }}>
          New KB document
        </p>
        <h1 className="text-2xl font-bold">Add knowledge base doc</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Workspace: {workspace.business_name}
        </p>
      </header>

      <KbDocForm workspaceId={workspaceId} />
    </div>
  );
}
