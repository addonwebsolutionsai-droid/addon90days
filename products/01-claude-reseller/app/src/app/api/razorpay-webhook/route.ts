import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env["RAZORPAY_WEBHOOK_SECRET"] ?? "";

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as { event: string; payload: { payment: { entity: { notes: { pack: string }; contact: string } } } };

  if (event.event === "payment.captured") {
    const { pack } = event.payload.payment.entity.notes;
    const contact = event.payload.payment.entity.contact;
    // TODO: grant access — write to DB, send confirmation email
    console.warn(`Payment captured: ${contact} purchased ${pack}`);
  }

  return NextResponse.json({ received: true });
}
