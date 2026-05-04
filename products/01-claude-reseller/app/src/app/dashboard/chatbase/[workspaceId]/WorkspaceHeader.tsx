/**
 * WorkspaceHeader — server component.
 * Shows business name, status badge, and connection mode.
 */

import type { P02Workspace } from "@/lib/p02/types";

interface Props {
  workspace: P02Workspace;
}

export function WorkspaceHeader({ workspace }: Props) {
  const isActive =
    workspace.whatsapp_phone_number_id !== null && !workspace.mock_mode;

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-bold">{workspace.business_name}</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Workspace ID: {workspace.id.slice(0, 8)}&hellip;
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Status badge */}
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium border"
          style={
            isActive
              ? {
                  backgroundColor: "rgba(34,197,94,0.1)",
                  borderColor: "rgba(34,197,94,0.25)",
                  color: "#22c55e",
                }
              : {
                  backgroundColor: "rgba(251,191,36,0.08)",
                  borderColor: "rgba(251,191,36,0.25)",
                  color: "#fbbf24",
                }
          }
        >
          {isActive ? "Active" : "Setup incomplete"}
        </span>

        {/* Connection mode badge */}
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium border"
          style={{
            backgroundColor: "rgba(6,182,212,0.08)",
            borderColor: "rgba(6,182,212,0.25)",
            color: "#06b6d4",
          }}
        >
          {workspace.mock_mode ? "MOCK_MODE" : "Live"}
        </span>
      </div>
    </div>
  );
}
