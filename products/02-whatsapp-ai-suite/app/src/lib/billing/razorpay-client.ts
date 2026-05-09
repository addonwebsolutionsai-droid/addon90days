// AUTO-SYNCED FROM packages/billing/src/razorpay-client.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:04:29.500Z
/**
 * Razorpay client singleton.
 *
 * The razorpay npm package ships CommonJS. We import it with require() to
 * avoid ESM interop issues in Next.js edge/node dual-mode compilation.
 *
 * Keys: RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (set on Vercel, see secrets/env-backup).
 * These are TEST keys in staging — switch to live keys before charging real cards.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require("razorpay") as new (opts: { key_id: string; key_secret: string }) => RazorpayInstance;

export interface RazorpayInstance {
  plans: {
    create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    fetch: (id: string) => Promise<Record<string, unknown>>;
  };
  subscriptions: {
    cancel: (id: string, cancelAtCycleEnd?: boolean) => Promise<Record<string, unknown>>;
    fetch: (id: string) => Promise<Record<string, unknown>>;
  };
  payments: {
    refund: (paymentId: string, data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    fetch: (id: string) => Promise<Record<string, unknown>>;
  };
}

let _client: RazorpayInstance | null = null;

export function getRazorpayClient(): RazorpayInstance {
  if (_client !== null) return _client;

  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)");
  }

  _client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _client;
}
