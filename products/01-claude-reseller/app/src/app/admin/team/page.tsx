/**
 * /admin/team — invite admin users + manage role assignments.
 *
 * RBAC-driven: anyone with `global.team.read` permission can view; only
 * `global.team.write` can mutate.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Shield, ChevronRight, Plus } from "lucide-react";
import { requirePermission } from "@/lib/rbac";
import { listRoles, listTeamMembers, listPermissions, type TeamMemberRow, type RoleRow } from "@/lib/rbac-admin";
import { TeamActions } from "./_TeamActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "Team · Admin" };

export default async function TeamPage() {
  const guard = await requirePermission("global.team.read");
  if (!guard.ok) {
    if (guard.reason === "unauthenticated") redirect("/sign-in?redirect_url=/admin/team");
    redirect("/admin");
  }
  const canWrite = guard.permissions.has("*") || guard.permissions.has("global.team.write");

  const [roles, members, permissions] = await Promise.all([
    listRoles(),
    listTeamMembers(),
    listPermissions(),
  ]);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Team &amp; access</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Grant admin users scoped access via role assignments. {canWrite ? "" : "(Read-only — you don't have global.team.write.)"}
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Team members"  value={String(members.length)} />
        <Stat label="Defined roles" value={String(roles.length)} sub={`${roles.filter((r) => r.is_system).length} system`} />
        <Stat label="Permissions"   value={String(permissions.length)} sub="canonical key set" />
        <Stat label="System super-admins" value="env" sub="ADMIN_USER_IDS bypass" />
      </section>

      {/* Members panel */}
      <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
        <header className="px-4 py-3 border-b flex items-baseline justify-between" style={{ borderColor: "var(--border-subtle)" }}>
          <h2 className="text-sm font-semibold flex items-center gap-2"><Users size={13} className="text-violet-400" /> Team members</h2>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{members.length} with at least one role</span>
        </header>
        {members.length === 0 ? (
          <div className="text-center py-10 text-xs" style={{ color: "var(--text-muted)" }}>
            No team members yet. Use the form below to assign a role to a Clerk user.
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {members.map((m) => <li key={m.clerk_user_id} style={{ borderColor: "var(--border-subtle)" }}><MemberRow member={m} canWrite={canWrite} /></li>)}
          </ul>
        )}
      </section>

      {/* Roles reference */}
      <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
        <header className="px-4 py-3 border-b flex items-baseline justify-between" style={{ borderColor: "var(--border-subtle)" }}>
          <h2 className="text-sm font-semibold flex items-center gap-2"><Shield size={13} className="text-violet-400" /> Roles</h2>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{roles.length} defined</span>
        </header>
        <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {roles.map((r) => <li key={r.id} style={{ borderColor: "var(--border-subtle)" }}><RoleSummaryRow role={r} /></li>)}
        </ul>
      </section>

      {/* Assign-role form */}
      {canWrite && (
        <section className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3"><Plus size={13} className="text-violet-400" /> Assign role to user</h2>
          <TeamActions roles={roles} />
        </section>
      )}

      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        To find a Clerk user ID: ask the user to visit <code>/api/whoami</code> while signed in — it returns their ID.
        Or look them up in the Clerk dashboard.
      </p>
    </div>
  );
}

// ===========================================================================
// Components
// ===========================================================================

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {sub !== undefined && <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

function MemberRow({ member, canWrite }: { member: TeamMemberRow; canWrite: boolean }) {
  return (
    <div className="flex items-start justify-between px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-mono">{member.clerk_user_id}</div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {member.roles.map((r) => (
            <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#c4b5fd" }}>
              {r.name}
            </span>
          ))}
        </div>
        <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
          {member.total_permissions} permission{member.total_permissions === 1 ? "" : "s"} · joined {new Date(member.joined_at).toISOString().slice(0, 10)}
        </div>
      </div>
      {canWrite && <ChevronRight size={14} className="text-violet-400 mt-1" />}
    </div>
  );
}

function RoleSummaryRow({ role }: { role: RoleRow }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="text-sm font-semibold">{role.name}</span>
          <span className="ml-2 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{role.slug}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
          <span className="px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "var(--bg-base)" }}>{role.scope}</span>
          {role.is_system && <span className="px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#c4b5fd" }}>SYSTEM</span>}
        </div>
      </div>
      {role.description !== null && (
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{role.description}</p>
      )}
    </div>
  );
}
