import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { isPlanId } from "@/lib/pricing";

const VerifyRequestSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
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

  const parsed = VerifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planId,
  } = parsed.data;

  if (!isPlanId(planId)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keySecret) {
    return NextResponse.json(
      { error: "Razorpay credentials not configured" },
      { status: 503 }
    );
  }

  // Verify Razorpay signature — HMAC-SHA256 of "orderId|paymentId" with key secret.
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    console.warn(`[api/billing/verify] Signature mismatch for user ${userId}`);
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Payment is authentic — update Clerk publicMetadata with the new plan.
  // Using publicMetadata (not privateMetadata) so the client can read plan status
  // without an extra API call — same pattern as P01 purchasedPacks.
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: planId,
        planActivatedAt: new Date().toISOString(),
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      },
    });

    return NextResponse.json({ success: true, plan: planId }, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update user metadata";
    console.error("[api/billing/verify] Clerk update error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
