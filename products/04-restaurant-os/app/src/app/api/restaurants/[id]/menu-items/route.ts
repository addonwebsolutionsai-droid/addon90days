/**
 * GET  /api/p04/restaurants/{id}/menu-items — list all menu items for a restaurant
 * POST /api/p04/restaurants/{id}/menu-items — create a menu item
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { listMenuItems, createMenuItem } from "@/lib/p04/db";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const CreateMenuItemSchema = z.object({
  category_id:      z.string().uuid(),
  name:             z.string().min(1).max(200),
  description:      z.string().max(500).optional(),
  price:            z.number().nonnegative(),
  gst_rate_percent: z.number().min(0).max(50).default(5),
  tags:             z.array(z.string().max(30)).max(10).default([]),
  photo_url:        z.string().url().optional(),
  is_available:     z.boolean().default(true),
  sort_order:       z.number().int().default(0),
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
    const items = await listMenuItems(restaurantId, userId);
    return NextResponse.json({ data: items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("not found or not owned")) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Restaurant not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to list menu items" } }, { status: 500 });
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
    key:           `p04_create_menu_item:${userId}`,
    limit:         500,
    windowSeconds: 3600,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = CreateMenuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.message, issues: parsed.error.issues } },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const item = await createMenuItem(
      {
        restaurant_id:    restaurantId,
        category_id:      input.category_id,
        name:             input.name,
        description:      input.description ?? null,
        price:            input.price,
        gst_rate_percent: input.gst_rate_percent,
        tags:             input.tags,
        photo_url:        input.photo_url ?? null,
        is_available:     input.is_available,
        sort_order:       input.sort_order,
      },
      userId,
    );
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("not found or not owned")) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Restaurant not found" } },
        { status: 404 },
      );
    }
    if (msg.includes("violates foreign key") || msg.includes("p04_menu_categories")) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "category_id does not exist in this restaurant" } },
        { status: 400 },
      );
    }
    console.error(`[p04/menu-items POST] ${msg}`);
    return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to create menu item" } }, { status: 500 });
  }
}
