/**
 * GET  /api/p04/restaurants/{id}/tables — list tables for a restaurant
 * POST /api/p04/restaurants/{id}/tables — create a table
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { listTables, createTable } from "@/lib/p04/db";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const CreateTableSchema = z.object({
  table_number: z.string().min(1).max(20),
  seats:        z.number().int().positive().max(50).default(4),
  section:      z.string().max(50).optional(),
  status:       z.enum(["available", "occupied", "reserved", "out_of_service"]).default("available"),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }

  const { id: restaurantId } = await ctx.params;

  try {
    const tables = await listTables(restaurantId, userId);
    return NextResponse.json({ data: tables });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("not found or not owned")) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Restaurant not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to list tables" } }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }

  const { id: restaurantId } = await ctx.params;

  const rate = await checkRateLimit({
    key:           `p04_create_table:${userId}`,
    limit:         100,
    windowSeconds: 3600,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = CreateTableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.message, issues: parsed.error.issues } },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const table = await createTable(
      {
        restaurant_id: restaurantId,
        table_number:  input.table_number,
        seats:         input.seats,
        section:       input.section ?? null,
        status:        input.status,
      },
      userId,
    );
    return NextResponse.json({ data: table }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("not found or not owned")) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Restaurant not found" } },
        { status: 404 },
      );
    }
    if (msg.includes("duplicate key") || msg.includes("unique")) {
      return NextResponse.json(
        { error: { code: "DUPLICATE", message: `Table number "${input.table_number}" already exists in this restaurant` } },
        { status: 409 },
      );
    }
    console.error(`[p04/tables POST] ${msg}`);
    return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to create table" } }, { status: 500 });
  }
}
