/**
 * GET /api/p04/restaurants/{id} — fetch a single restaurant (ownership-scoped)
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRestaurant } from "@/lib/p04/db";

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

  const { id } = await ctx.params;
  const restaurant = await getRestaurant(id, userId);
  if (restaurant === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Restaurant not found" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: restaurant });
}
