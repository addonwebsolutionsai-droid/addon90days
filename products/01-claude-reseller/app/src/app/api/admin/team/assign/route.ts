/**
 * POST /api/admin/team/assign — assign a role to a Clerk user.
 * Body: { clerk_user_id: string, role_id: uuid }
 *
 * Auth: requirePermission("global.team.write").
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission, invalidateUserPermissionsCache } from "@/lib/rbac";
import { assignRoleToUser, listRoles } from "@/lib/rbac-admin";
import { logAdminAction } from "@/lib/audit";

const Schema = z.object({
  clerk_user_id: z.string().min(1).max(120),
  role_id:       z.string().uuid(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requirePermission("global.team.write");
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.reason === "unauthenticated" ? "UNAUTHORIZED" : "FORBIDDEN", message: "Permission denied: global.team.write" } },
      { status: guard.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.message } }, { status: 400 });
  }

  // Verify the role exists (defensive; FK would catch it but the message is friendlier)
  const roles = await listRoles();
  const role = roles.find((r) => r.id === parsed.data.role_id);
  if (role === undefined) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Role not found" } }, { status: 404 });
  }

  try {
    await assignRoleToUser({
      clerk_user_id: parsed.data.clerk_user_id,
      role_id:       parsed.data.role_id,
      assigned_by:   guard.userId,
    });
    invalidateUserPermissionsCache(parsed.data.clerk_user_id);

    await logAdminAction({
      adminClerkUserId: guard.userId,
      action:           "global.team.assign_role",
      resourceType:     "admin_user_roles",
      resourceId:       `${parsed.data.clerk_user_id}:${parsed.data.role_id}`,
      meta:             { role_slug: role.slug, role_name: role.name },
    });

    return NextResponse.json({ data: { ok: true, role: { slug: role.slug, name: role.name } } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: { code: "INTERNAL", message: msg } }, { status: 500 });
  }
}
