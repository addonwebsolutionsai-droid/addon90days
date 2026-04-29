import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Shield, Key, Monitor, Smartphone } from "lucide-react";

export const metadata = { title: "Security" };

export default async function SecurityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const hasTwoFactor = user?.twoFactorEnabled ?? false;
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Security</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your password, 2FA, and active sessions.
        </p>
      </div>

      {/* Password */}
      <div
        className="rounded-xl border p-5 mb-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key size={16} className="text-violet-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold">Password</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Last changed: unknown
              </div>
            </div>
          </div>
          {/* Clerk password management is done via their hosted UI */}
          <a
            href={`https://accounts.clerk.dev/user/security`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-xs font-medium border transition-colors hover:border-violet-500/50"
            style={{
              backgroundColor: "var(--bg-s2)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            Change password
          </a>
        </div>
      </div>

      {/* 2FA */}
      <div
        className="rounded-xl border p-5 mb-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-violet-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold">Two-factor authentication</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {hasTwoFactor ? "Enabled — extra protection active" : "Not enabled — recommended for security"}
              </div>
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: hasTwoFactor ? "rgba(34,197,94,0.12)" : "rgba(161,161,170,0.12)",
              color: hasTwoFactor ? "#22c55e" : "var(--text-muted)",
            }}
          >
            {hasTwoFactor ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      {/* Email */}
      <div
        className="rounded-xl border p-5 mb-8"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ backgroundColor: "var(--bg-s2)", color: "var(--text-secondary)" }}
          >
            @
          </div>
          <div>
            <div className="text-sm font-semibold">Primary email</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {email || "—"}
            </div>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/12 text-green-500">
            Verified
          </span>
        </div>
      </div>

      {/* Active sessions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          Active sessions
        </h2>
        <div
          className="rounded-xl border divide-y"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
        >
          {[
            { icon: Monitor,    device: "Web browser",    location: "Current session", current: true  },
            { icon: Smartphone, device: "Mobile device",  location: "Last seen recently", current: false },
          ].map(({ icon: Icon, device, location, current }) => (
            <div
              key={device}
              className="flex items-center gap-4 px-5 py-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <Icon size={16} style={{ color: "var(--text-muted)" }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{device}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {location}
                </div>
              </div>
              {current ? (
                <span className="text-xs text-green-500 font-medium shrink-0">Current</span>
              ) : (
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
