import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";
import { z } from "zod";

const BodySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  packId: z.string(),
});

const VALID_PACKS = new Set([
  "iot-developer-pack",
  "developer-productivity-pack",
  "smb-operations-pack",
  "all-access-monthly",
]);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = BodySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packId } = body.data;

  if (!VALID_PACKS.has(packId)) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  // Verify Razorpay signature
  const keySecret = process.env["RAZORPAY_KEY_SECRET"] ?? "";
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Grant access in Clerk publicMetadata
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = (user.publicMetadata["purchasedPacks"] as string[] | undefined) ?? [];

  if (!existing.includes(packId)) {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        purchasedPacks: [...existing, packId],
      },
    });
  }

  return NextResponse.json({ success: true, packId });
}
