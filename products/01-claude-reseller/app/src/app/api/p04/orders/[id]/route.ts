/**
 * GET /api/p04/orders/{id} — fetch an order with all its items
 *
 * Ownership scoped: only the owner of the restaurant that owns this order
 * can read it. The DB join in getOrderWithItems() enforces this.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrderWithItems } from "@/lib/p04/db";

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

  const { id: orderId } = await ctx.params;

  try {
    const result = await getOrderWithItems(orderId, userId);
    if (result === null) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`[p04/orders/${orderId} GET] ${msg}`);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to fetch order" } },
      { status: 500 },
    );
  }
}
