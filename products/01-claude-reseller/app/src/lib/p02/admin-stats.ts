/**
 * P02 ChatBase — admin dashboard data loaders.
 *
 * All queries use the service-role client. NO RLS scoping — admin sees
 * everything across all workspaces. The admin gate (`requireAdmin`) is
 * enforced upstream by the page's layout.tsx, so by the time these
 * functions run we know the caller is an admin.
 *
 * One Promise.all() returns the full dashboard panel set so the page
 * loads with a single round-trip instead of waterfalling.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p02(table: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(table);
}

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export interface ChatbaseAdminKpis {
  totalWorkspaces:        number;
  conversationsAllTime:   number;
  conversationsToday:     number;
  messagesAllTime:        number;
  messagesToday:          number;
  /** Percentage 0-100 of conversations created in last 7 days that ended escalated. */
  escalationRate7d:       number;
  /** Average classification confidence (0-1) over last 7 days, classified messages only. */
  avgConfidence7d:        number;
  /** Number of conversations currently sitting in `escalated` status, awaiting human takeover. */
  escalatedQueueDepth:    number;
}

export interface IntentBreakdownRow {
  intent: string;
  count:  number;
}

export interface WorkspaceRow {
  id:                       string;
  business_name:            string;
  owner_clerk_user_id:      string;
  mock_mode:                boolean;
  whatsapp_phone_number_id: string | null;
  created_at:               string;
  conversations_count:      number;
  /** Reserved — not populated in MVP loader (would need a conversation join, expensive at admin scope). */
  messages_count:           number;
}

export interface RecentConversationRow {
  id:                 string;
  workspace_id:       string;
  workspace_name:     string;
  customer_phone:     string;
  customer_name:      string | null;
  status:             string;
  last_intent:        string | null;
  message_count:      number;
  last_message_at:    string;
  /** Body of the most recent message (in OR out) — used for the row preview. */
  last_message_body:  string | null;
  /** Whether the most recent message was inbound (customer waiting for reply). */
  last_message_is_inbound: boolean;
  created_at:         string;
}

export interface RecentMessageRow {
  id:              string;
  workspace_name:  string;
  conversation_id: string;
  customer_phone:  string;
  direction:       string;
  role:            string;
  intent:          string | null;
  confidence:      number | null;
  body:            string;
  created_at:      string;
}

export interface ChatbaseAdminDashboardData {
  kpis:                ChatbaseAdminKpis;
  intentBreakdown7d:   IntentBreakdownRow[];
  workspaces:          WorkspaceRow[];
  recentConversations: RecentConversationRow[];
  recentMessages:      RecentMessageRow[];
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

const todayStartUtc = (): string => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

const sevenDaysAgoUtc = (): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString();
};

export async function loadChatbaseAdminDashboard(): Promise<ChatbaseAdminDashboardData> {
  const todayStart = todayStartUtc();
  const sevenDays  = sevenDaysAgoUtc();

  // --- Single round-trip: all aggregate counts in parallel ---------------
  const [
    workspacesRes,
    conversationsAllRes,
    conversationsTodayRes,
    messagesAllRes,
    messagesTodayRes,
    escalated7dRes,
    total7dRes,
    avgConfRes,
    escalatedQueueRes,
    intentBreakdownRes,
    workspacesListRes,
    recentConversationsRes,
    recentMessagesRes,
  ] = await Promise.all([
    p02("p02_workspaces").select("id", { count: "exact", head: true }),

    p02("p02_conversations").select("id", { count: "exact", head: true }),
    p02("p02_conversations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart),

    p02("p02_messages").select("id", { count: "exact", head: true }),
    p02("p02_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart),

    p02("p02_conversations")
      .select("id", { count: "exact", head: true })
      .eq("status", "escalated")
      .gte("created_at", sevenDays),
    p02("p02_conversations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDays),

    p02("p02_messages")
      .select("confidence")
      .not("confidence", "is", null)
      .gte("created_at", sevenDays),

    p02("p02_conversations")
      .select("id", { count: "exact", head: true })
      .eq("status", "escalated"),

    p02("p02_messages")
      .select("intent")
      .not("intent", "is", null)
      .gte("created_at", sevenDays),

    // List of all workspaces (limit 50 — admin-only, low cardinality expected)
    p02("p02_workspaces")
      .select("id, business_name, owner_clerk_user_id, mock_mode, whatsapp_phone_number_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50),

    // Recent conversations across all workspaces
    p02("p02_conversations")
      .select("id, workspace_id, customer_phone, customer_name, status, last_intent, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(20),

    // Recent messages
    p02("p02_messages")
      .select("id, conversation_id, direction, role, intent, confidence, body, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // --- Aggregate computations -------------------------------------------
  const totalWorkspaces      = workspacesRes.count ?? 0;
  const conversationsAllTime = conversationsAllRes.count ?? 0;
  const conversationsToday   = conversationsTodayRes.count ?? 0;
  const messagesAllTime      = messagesAllRes.count ?? 0;
  const messagesToday        = messagesTodayRes.count ?? 0;

  const escalated7d = escalated7dRes.count ?? 0;
  const total7d     = total7dRes.count ?? 0;
  const escalationRate7d = total7d > 0 ? (escalated7d / total7d) * 100 : 0;

  const confidenceRows = (avgConfRes.data ?? []) as Array<{ confidence: string | number }>;
  const avgConfidence7d = confidenceRows.length > 0
    ? confidenceRows.reduce((sum, r) => sum + Number(r.confidence ?? 0), 0) / confidenceRows.length
    : 0;

  const escalatedQueueDepth = escalatedQueueRes.count ?? 0;

  // --- Intent breakdown -------------------------------------------------
  const intentRows = (intentBreakdownRes.data ?? []) as Array<{ intent: string }>;
  const intentMap = new Map<string, number>();
  for (const row of intentRows) {
    intentMap.set(row.intent, (intentMap.get(row.intent) ?? 0) + 1);
  }
  const intentBreakdown7d: IntentBreakdownRow[] = Array.from(intentMap.entries())
    .map(([intent, count]) => ({ intent, count }))
    .sort((a, b) => b.count - a.count);

  // --- Workspaces enriched with conversation/message counts -------------
  // For each workspace, count its conversations + messages. Done in a
  // second batch so we don't need a window function. Acceptable at admin
  // cardinality (<100 workspaces in production).
  const workspaceRows = (workspacesListRes.data ?? []) as Array<{
    id: string; business_name: string; owner_clerk_user_id: string;
    mock_mode: boolean; whatsapp_phone_number_id: string | null; created_at: string;
  }>;

  // For each workspace, just count conversations. Messages-per-workspace is
  // skipped in the MVP — too expensive at this layer (would need a join). We
  // already show global message counts in KPIs and per-conversation counts in
  // the recent-conversations panel.
  const workspaces: WorkspaceRow[] = await Promise.all(
    workspaceRows.map(async (w) => {
      const { count: convCount } = await p02("p02_conversations")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", w.id);
      return {
        id:                       w.id,
        business_name:            w.business_name,
        owner_clerk_user_id:      w.owner_clerk_user_id,
        mock_mode:                w.mock_mode,
        whatsapp_phone_number_id: w.whatsapp_phone_number_id,
        created_at:               w.created_at,
        conversations_count:      convCount ?? 0,
        messages_count:           0,
      };
    }),
  );

  // --- Recent conversations enriched with workspace name + msg count ----
  const conversationRows = (recentConversationsRes.data ?? []) as Array<{
    id: string; workspace_id: string; customer_phone: string; customer_name: string | null;
    status: string; last_intent: string | null; created_at: string; updated_at: string;
  }>;
  const workspaceNameById = new Map(workspaces.map((w) => [w.id, w.business_name]));

  const recentConversations: RecentConversationRow[] = await Promise.all(
    conversationRows.map(async (c) => {
      // Pull the most recent message + count in parallel
      const [{ count: msgCount }, lastMsgRes] = await Promise.all([
        p02("p02_messages").select("id", { count: "exact", head: true }).eq("conversation_id", c.id),
        p02("p02_messages")
          .select("body, direction, created_at")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const lastMsg = (lastMsgRes.data ?? null) as { body: string; direction: string; created_at: string } | null;

      return {
        id:                       c.id,
        workspace_id:             c.workspace_id,
        workspace_name:           workspaceNameById.get(c.workspace_id) ?? "(unknown workspace)",
        customer_phone:           c.customer_phone,
        customer_name:            c.customer_name,
        status:                   c.status,
        last_intent:              c.last_intent,
        message_count:            msgCount ?? 0,
        last_message_at:          lastMsg?.created_at ?? c.updated_at,
        last_message_body:        lastMsg?.body ?? null,
        last_message_is_inbound:  lastMsg?.direction === "inbound",
        created_at:               c.created_at,
      };
    }),
  );

  // --- Recent messages enriched with workspace name + customer phone ----
  const messageRows = (recentMessagesRes.data ?? []) as Array<{
    id: string; conversation_id: string; direction: string; role: string;
    intent: string | null; confidence: string | number | null; body: string; created_at: string;
  }>;

  // We need conversation -> workspace + customer_phone. Batch one lookup
  // by conversation_id rather than N+1.
  const conversationIds = Array.from(new Set(messageRows.map((m) => m.conversation_id)));
  const convLookupRes = conversationIds.length > 0
    ? await p02("p02_conversations")
        .select("id, workspace_id, customer_phone")
        .in("id", conversationIds)
    : { data: [] };

  const convById = new Map(
    ((convLookupRes.data ?? []) as Array<{ id: string; workspace_id: string; customer_phone: string }>)
      .map((c) => [c.id, c]),
  );

  const recentMessages: RecentMessageRow[] = messageRows.map((m) => {
    const c = convById.get(m.conversation_id);
    return {
      id:              m.id,
      conversation_id: m.conversation_id,
      workspace_name:  c !== undefined ? (workspaceNameById.get(c.workspace_id) ?? "(unknown)") : "(unknown)",
      customer_phone:  c?.customer_phone ?? "—",
      direction:       m.direction,
      role:            m.role,
      intent:          m.intent,
      confidence:      m.confidence !== null ? Number(m.confidence) : null,
      body:            m.body,
      created_at:      m.created_at,
    };
  });

  return {
    kpis: {
      totalWorkspaces,
      conversationsAllTime,
      conversationsToday,
      messagesAllTime,
      messagesToday,
      escalationRate7d,
      avgConfidence7d,
      escalatedQueueDepth,
    },
    intentBreakdown7d,
    workspaces,
    recentConversations,
    recentMessages,
  };
}
