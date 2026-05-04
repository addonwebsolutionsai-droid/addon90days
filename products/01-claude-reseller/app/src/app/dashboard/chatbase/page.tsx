/**
 * /dashboard/chatbase — workspace home (list + create)
 *
 * Server component: fetches workspaces from the API using the Clerk session.
 * Re-validates on every visit (no caching) so new workspaces appear immediately.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { P02Workspace } from "@/lib/p02/types";
import { WorkspaceList } from "./WorkspaceList";

// Fetch workspace list server-side using the internal API.
// We call the route handler directly via absolute URL (Next.js App Router pattern).
async function fetchWorkspaces(clerkToken: string): Promise<P02Workspace[]> {
  // Build URL from the request headers so it works in both local and Vercel.
  const reqHeaders = await headers();
  const host = reqHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const url = `${protocol}://${host}/api/p02/workspaces`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${clerkToken}` },
    // No cache — owner sees their workspace list up to date on every load.
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json = (await res.json()) as { data?: P02Workspace[] };
  return json.data ?? [];
}

export default async function ChatbaseDashboardHome() {
  const { userId, getToken } = await auth();
  if (userId === null) redirect("/sign-in");

  const token = await getToken();
  const workspaces = token !== null ? await fetchWorkspaces(token) : [];

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Your workspaces</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Each workspace is one WhatsApp Business number + AI agent. During beta, workspaces are
          free and run in mock mode until you complete Meta verification.
        </p>
      </div>

      {/* Workspace list + create form — client component handles interactivity */}
      <WorkspaceList initialWorkspaces={workspaces} />
    </div>
  );
}
