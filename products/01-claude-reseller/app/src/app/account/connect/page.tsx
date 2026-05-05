import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Plug } from "lucide-react";
import { MCPConnect } from "@/components/mcp-connect";

export const metadata = { title: "Connect Claude Desktop" };

export default async function ConnectPage() {
  const { userId } = await auth();
  if (userId === null) redirect("/sign-in?redirect_url=/account/connect");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Connect Claude Desktop</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Paste this MCP config block once and all 130 skills appear as tools inside Claude Desktop.
        </p>
      </div>

      <section
        className="rounded-xl border p-6"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
            <Plug size={16} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-0.5">MCP server config</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Open Claude Desktop → Settings → Developer → Edit Config. Merge this block into your existing config.
            </p>
          </div>
        </div>
        <MCPConnect />
      </section>
    </div>
  );
}
