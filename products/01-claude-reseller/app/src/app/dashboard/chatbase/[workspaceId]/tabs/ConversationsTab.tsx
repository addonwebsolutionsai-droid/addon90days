/**
 * ConversationsTab — server component shell, client drawer for message detail.
 *
 * Renders conversation list server-side.
 * ConversationDrawer is a client component (interactivity: fetch messages, take-over, send).
 */

import type { P02Conversation } from "@/lib/p02/types";
import { ConversationRow } from "./ConversationRow";
import { MessageSquare } from "lucide-react";

interface Props {
  conversations: P02Conversation[];
  workspaceId: string;
}

export function ConversationsTab({ conversations, workspaceId }: Props) {
  if (conversations.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed p-12 text-center"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div
          className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "rgba(34,197,94,0.08)" }}
        >
          <MessageSquare size={22} className="text-green-500" />
        </div>
        <h3 className="font-semibold mb-1">No conversations yet</h3>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Use the MockChat in Settings to simulate your first customer message, or wait for
          real messages once your WhatsApp number is connected.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Column headers */}
      <div
        className="grid grid-cols-[1fr_auto_auto_auto_2fr_auto] gap-3 px-4 py-2 text-xs font-medium uppercase tracking-wider mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        <span>Customer</span>
        <span>Intent</span>
        <span>Status</span>
        <span>Msgs</span>
        <span>Last message</span>
        <span>Updated</span>
      </div>

      <div className="space-y-1">
        {conversations.map((conv) => (
          <ConversationRow key={conv.id} conversation={conv} workspaceId={workspaceId} />
        ))}
      </div>
    </div>
  );
}
