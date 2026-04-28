import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env["RAZORPAY_KEY_ID"] ?? "",
  key_secret: process.env["RAZORPAY_KEY_SECRET"] ?? "",
});

export const SKILL_PACK_PRICES = {
  "iot-developer-pack": { amountPaise: 4900 * 83, label: "IoT Developer Pack", usd: 49 },
  "developer-productivity-pack": { amountPaise: 2900 * 83, label: "Developer Productivity Pack", usd: 29 },
  "smb-operations-pack": { amountPaise: 2900 * 83, label: "SMB Operations Pack", usd: 29 },
  "all-access-monthly": { amountPaise: 2900 * 83, label: "All-Access Monthly", usd: 29 },
} as const;

export type SkillPackId = keyof typeof SKILL_PACK_PRICES;
