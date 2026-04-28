import { NextResponse } from "next/server";
import { getRazorpay, SKILL_PACK_PRICES, type SkillPackId } from "@/lib/razorpay";

export async function POST(req: Request) {
  const body = await req.json() as { packId: string };
  const packId = body.packId as SkillPackId;

  const pack = SKILL_PACK_PRICES[packId];
  if (!pack) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  const order = await getRazorpay().orders.create({
    amount: pack.amountPaise,
    currency: "INR",
    receipt: `receipt_${packId}_${Date.now()}`,
    notes: { pack: packId },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env["RAZORPAY_KEY_ID"],
    packLabel: pack.label,
  });
}
