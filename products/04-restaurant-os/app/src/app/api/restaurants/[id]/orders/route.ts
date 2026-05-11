/**
 * GET  /api/p04/restaurants/{id}/orders — list open orders (KDS / dashboard feed)
 * POST /api/p04/restaurants/{id}/orders — create an order
 *
 * POST is the keystone route for Phase 1. Client sends items; server computes
 * all tax fields via lib/p03/gst-calc.ts and persists both header + items.
 * The client never sets financial fields — the server is the sole source of
 * truth for money math.
 *
 * Query params for GET:
 *   ?status=open|sent_to_kitchen|ready|served|paid|cancelled
 *   (omit for all active statuses: open, sent_to_kitchen, ready, served)
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createOrder, listOpenOrders } from "@/lib/p04/db";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const OrderItemDraftSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity:     z.number().int().positive().max(99),
  modifiers:    z.record(z.unknown()).optional(),
  notes:        z.string().max(500).optional(),
});

const CreateOrderSchema = z.object({
  table_id:       z.string().uuid().optional().nullable(),
  order_kind:     z.enum(["dine_in", "takeaway", "delivery"]).default("dine_in"),
  customer_name:  z.string().max(100).optional().nullable(),
  customer_phone: z.string().max(20).optional().nullable(),
  notes:          z.string().max(1000).optional().nullable(),
  items:          z.array(OrderItemDraftSchema).min(1).max(50),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { userId } = await auth();
  if (userId === null) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }

  const { id: restaurantId } = await ctx.params;
  const statusFilter = req.nextUrl.searchParams.get("status") ?? undefined;

  try {
    const orders = await listOpenOrders(restaurantId, userId, statusFilter);
    return NextResponse.json({ data: orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("not found or not owned")) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Restaurant not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to list orders" } }, { status: 500 });
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

  // 300/hr — a busy restaurant might place hundreds of orders per day.
  const rate = await checkRateLimit({
    key:           `p04_create_order:${userId}`,
    limit:         300,
    windowSeconds: 3600,
  });
  if (!rate.allowed) return rateLimitedResponse(rate.retryAfterSec) as unknown as NextResponse;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON" } }, { status: 400 }); }

  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: parsed.error.message, issues: parsed.error.issues } },
      { status: 400 },
    );
  }

  const draft = parsed.data;

  try {
    const result = await createOrder(
      {
        restaurant_id:  restaurantId,
        table_id:       draft.table_id ?? null,
        order_kind:     draft.order_kind,
        customer_name:  draft.customer_name ?? null,
        customer_phone: draft.customer_phone ?? null,
        notes:          draft.notes ?? null,
        items:          draft.items.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity:     i.quantity,
          modifiers:    i.modifiers ?? {},
          notes:        i.notes,
        })),
      },
      userId,
    );
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("not found or not owned")) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Restaurant not found" } },
        { status: 404 },
      );
    }
    if (msg.includes("not found in restaurant")) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: msg } },
        { status: 400 },
      );
    }
    if (msg.includes("unavailable")) {
      return NextResponse.json(
        { error: { code: "ITEM_UNAVAILABLE", message: msg } },
        { status: 422 },
      );
    }
    console.error(`[p04/orders POST] ${msg}`);
    return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to create order" } }, { status: 500 });
  }
}
