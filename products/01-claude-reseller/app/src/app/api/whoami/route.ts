/**
 * GET /api/whoami
 *
 * Debug endpoint for the admin gate. Returns the authenticated user's Clerk
 * ID and whether they match ADMIN_USER_IDS. Sanitises the env value before
 * returning — only shows ID prefixes and a count, never the full whitelist.
 *
 * Auth: Clerk required. Useful when the admin layout silently redirects to
 * "/" and you can't tell whether it was an unauthenticated redirect or a
 * not-admin redirect.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      {
        authenticated: false,
        message: "Not signed in. Visit /sign-in first, then revisit this URL.",
      },
      { status: 200 },
    );
  }

  const raw = process.env["ADMIN_USER_IDS"] ?? "";
  const ids = raw.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const isAdmin = ids.includes(userId);

  return NextResponse.json({
    authenticated: true,
    your_clerk_user_id: userId,
    is_admin: isAdmin,
    admin_list_count: ids.length,
    admin_list_first_chars: ids.map((id) => id.slice(0, 12) + "…"),
    debug_hint: isAdmin
      ? "All good. Visit /admin/chatbase and you should be in."
      : `Your ID '${userId}' is NOT in ADMIN_USER_IDS. Compare against the prefixes above and update Vercel env (then redeploy).`,
  });
}
