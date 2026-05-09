/**
 * POST /api/admin/team/revoke — revoke a role from a Clerk user.
 * Body: { clerk_user_id: string, role_id: uuid }
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission, invalidateUserPermissionsCache } from "@/lib/rbac";
import { revokeRoleFromUser } from "@/lib/rbac-admin";
import { logAdminAction } from "@/lib/audit";

const Schema = z.object({
  clerk_user_id: z.string().min(1).max(120),
  role_id:       z.string().uuid(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const guard = await requirePermission("global.team.write");
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.reason === "unauthenticated" ? "UNAUTHORIZED" : "FORBIDDEN", message: "Permission denied" } },
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

  try {
    await revokeRoleFromUser(parsed.data.clerk_user_id, parsed.data.role_id);
    invalidateUserPermissionsCache(parsed.data.clerk_user_id);

    await logAdminAction({
      adminClerkUserId: guard.userId,
      action:           "global.team.revoke_role",
      resourceType:     "admin_user_roles",
      resourceId:       `${parsed.data.clerk_user_id}:${parsed.data.role_id}`,
    });

    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: { code: "INTERNAL", message: msg } }, { status: 500 });
  }
}
