/**
 * SettingsTab — server component shell.
 *
 * Contains:
 * - Business name (editable via SettingsForm client component)
 * - Timezone / locale (read-only)
 * - Escalation threshold slider (SettingsForm)
 * - Mock mode section (informational)
 * - MockChat widget (client component)
 */

import type { P02Workspace, P02Intent } from "@/lib/p02/types";
import { SettingsForm } from "./SettingsForm";
import { MockChat } from "./MockChat";

interface Props {
  workspace: P02Workspace;
  intents: P02Intent[];
}

export function SettingsTab({ workspace, intents: _intents }: Props) {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* General settings */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">General</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Basic workspace configuration.
          </p>
        </div>

        <SettingsForm workspace={workspace} />

        {/* Read-only fields */}
        <div
          className="rounded-xl border divide-y"
          style={{
            borderColor: "var(--border-subtle)",
            // @ts-expect-error CSS custom property not in React types
            "--divider": "var(--border-subtle)",
          }}
        >
          {[
            { label: "Timezone", value: workspace.timezone },
            { label: "Locale", value: workspace.locale },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
              <span
                className="text-sm font-mono px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--bg-s2)", color: "var(--text-secondary)" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Mock mode section */}
      <section className="space-y-3">
        <h2 className="font-semibold">WhatsApp connection</h2>
        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: "rgba(6,182,212,0.04)",
            borderColor: "rgba(6,182,212,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#06b6d4" }}
              aria-hidden="true"
            />
            <span className="font-medium text-sm" style={{ color: "#06b6d4" }}>
              Currently in MOCK_MODE
            </span>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
            All messages are stored in the database but not sent to real WhatsApp numbers.
            To go live, the founder needs to complete Meta Business Manager verification
            (3&ndash;7 business days). Once verified, we will configure the WhatsApp Cloud API
            and flip MOCK_MODE to false.
          </p>
          <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Steps to go live:
          </p>
          <ol
            className="text-xs mt-1.5 space-y-1 list-decimal list-inside"
            style={{ color: "var(--text-muted)" }}
          >
            <li>Complete Meta Business Manager verification (founder action).</li>
            <li>Create a WhatsApp App at developers.facebook.com.</li>
            <li>Add WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN to Vercel env.</li>
            <li>Set MOCK_MODE=false in Vercel (production target only).</li>
          </ol>
        </div>
      </section>

      {/* MockChat */}
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">Test the bot</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Simulate a customer WhatsApp message and see the AI reply. This is the primary demo
            tool before Meta verification is complete.
          </p>
        </div>
        <MockChat workspaceId={workspace.id} />
      </section>
    </div>
  );
}
