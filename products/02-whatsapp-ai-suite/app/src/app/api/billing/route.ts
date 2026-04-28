import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { PLANS, isPlanId } from "@/lib/pricing";

const BillingRequestSchema = z.object({
  planId: z.string(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BillingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { planId } = parsed.data;
  if (!isPlanId(planId)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const plan = PLANS[planId];

  // Lazily require Razorpay — instantiating at module level causes build failure
  // because the constructor tries to validate keys that don't exist at build time.
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay credentials not configured" },
      { status: 503 }
    );
  }

  // Dynamic import keeps Razorpay out of the edge bundle and avoids module-level
  // instantiation which crashes the Next.js build when env vars are absent.
  const Razorpay = (await import("razorpay")).default;
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await razorpay.orders.create({
      amount: plan.amountPaise,
      currency: "INR",
      receipt: `chatbase-${userId}-${planId}-${Date.now()}`,
      notes: {
        userId,
        planId,
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
        planName: plan.name,
      },
      { status: 200 }
    );
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : "Failed to create order";
    console.error("[api/billing] Razorpay order error:", errMessage);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
