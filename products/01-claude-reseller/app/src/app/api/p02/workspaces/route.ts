/**
 * POST /api/p02/workspaces — create a new workspace
 * GET  /api/p02/workspaces — list workspaces owned by the authenticated user
 *
 * Auth: Clerk required.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createWorkspace } from "@/lib/p02/db";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { P02Workspace } from "@/lib/p02/types";

const CreateWorkspaceSchema = z.object({
  business_name: z.string().min(1).max(120),
  timezone: z.string().max(60).optional(),
  locale: z.string().max(10).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const rate = await checkRateLimit({
    key: `p02_create_workspace:${userId}`,
    limit: 5,
    windowSeconds: 3600,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const parsed = CreateWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  try {
    const workspace = await createWorkspace({
      owner_clerk_user_id: userId,
      business_name: parsed.data.business_name,
      timezone: parsed.data.timezone,
      locale: parsed.data.locale,
    });

    return NextResponse.json(
      { data: sanitizeWorkspace(workspace) },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[p02/workspaces POST] ${msg}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to create workspace" } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("p02_workspaces")
    .select("*")
    .eq("owner_clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (error !== null) {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to list workspaces" } },
      { status: 500 }
    );
  }

  const workspaces = (data as P02Workspace[]).map(sanitizeWorkspace);
  return NextResponse.json({ data: workspaces });
}

function sanitizeWorkspace(w: P02Workspace): Omit<P02Workspace, "whatsapp_access_token_enc"> {
  const { whatsapp_access_token_enc: _enc, ...safe } = w;
  return safe;
}
