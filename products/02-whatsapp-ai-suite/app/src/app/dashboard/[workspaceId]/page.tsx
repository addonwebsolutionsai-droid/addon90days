/**
 * /dashboard/[workspaceId] — workspace overview with tab nav
 *
 * Component tree:
 *   WorkspacePage (server)
 *     WorkspaceHeader (server)
 *     TabNav (client — URL-driven, no client-router chaos)
 *     ConversationsTab | KnowledgeTab | IntentsTab | SettingsTab (server)
 *
 * All tab content is rendered server-side. Tab navigation is a plain <a> link
 * that changes ?tab= in the URL, causing Next.js to re-render the server component
 * with the right tab content. No useState for tabs.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import type { P02Workspace, P02Conversation, P02KbDoc, P02Intent } from "@/lib/p02/types";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { TabNav } from "./TabNav";
import { ConversationsTab } from "./tabs/ConversationsTab";
import { KnowledgeTab } from "./tabs/KnowledgeTab";
import { IntentsTab } from "./tabs/IntentsTab";
import { SettingsTab } from "./tabs/SettingsTab";

// ---------------------------------------------------------------------------
// Data fetchers — server-side via internal API
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  token: string,
  host: string
): Promise<T | null> {
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const res = await fetch(`${protocol}://${host}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: T };
  return json.data ?? null;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

type TabKey = "conversations" | "knowledge" | "intents" | "settings";

function resolveTab(raw: string | undefined): TabKey {
  const allowed: TabKey[] = ["conversations", "knowledge", "intents", "settings"];
  return allowed.includes(raw as TabKey) ? (raw as TabKey) : "conversations";
}

export default async function WorkspacePage({ params, searchParams }: PageProps) {
  const { userId, getToken } = await auth();
  if (userId === null) redirect("/sign-in");

  const { workspaceId } = await params;
  const { tab: rawTab } = await searchParams;
  const activeTab = resolveTab(rawTab);

  const token = await getToken();
  if (token === null) redirect("/sign-in");

  const reqHeaders = await headers();
  const host = reqHeaders.get("host") ?? "localhost:3000";

  // Workspace is always fetched — needed for header on every tab.
  const workspace = await apiFetch<P02Workspace>(
    `/api/workspaces/${workspaceId}`,
    token,
    host
  );

  if (workspace === null) notFound();

  // Fetch tab-specific data in parallel where possible.
  const [conversations, kbDocs, intents] = await Promise.all([
    activeTab === "conversations"
      ? apiFetch<P02Conversation[]>(
          `/api/workspaces/${workspaceId}/conversations`,
          token,
          host
        )
      : Promise.resolve(null),
    activeTab === "knowledge"
      ? apiFetch<P02KbDoc[]>(
          `/api/workspaces/${workspaceId}/kb/list`,
          token,
          host
        )
      : Promise.resolve(null),
    activeTab === "intents" || activeTab === "settings"
      ? apiFetch<P02Intent[]>(
          `/api/workspaces/${workspaceId}/intents`,
          token,
          host
        )
      : Promise.resolve(null),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <TabNav workspaceId={workspaceId} activeTab={activeTab} />

      <div>
        {activeTab === "conversations" && (
          <ConversationsTab
            conversations={conversations ?? []}
            workspaceId={workspaceId}
          />
        )}
        {activeTab === "knowledge" && (
          <KnowledgeTab
            docs={kbDocs ?? []}
            workspaceId={workspaceId}
          />
        )}
        {activeTab === "intents" && (
          <IntentsTab intents={intents ?? []} />
        )}
        {activeTab === "settings" && (
          <SettingsTab workspace={workspace} intents={intents ?? []} />
        )}
      </div>
    </div>
  );
}
