// Plan definitions for ChatBase.
// priceINR is the display price; amountPaise is what Razorpay receives (INR * 100).
// messages: -1 means unlimited.

export type PlanId = "starter" | "growth" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  priceINR: number;
  messages: number;
  amountPaise: number;
};

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceINR: 999,
    messages: 500,
    amountPaise: 999 * 100,
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceINR: 2999,
    messages: 5000,
    amountPaise: 2999 * 100,
  },
  business: {
    id: "business",
    name: "Business",
    priceINR: 5999,
    messages: -1,
    amountPaise: 5999 * 100,
  },
};

export function isPlanId(value: unknown): value is PlanId {
  return value === "starter" || value === "growth" || value === "business";
}
