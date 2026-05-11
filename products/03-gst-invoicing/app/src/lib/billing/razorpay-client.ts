// AUTO-SYNCED FROM packages/billing/src/razorpay-client.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-11T10:14:11.440Z
/**
 * Razorpay API client — edge-runtime compatible.
 *
 * The official `razorpay` npm package depends on Node's `http` + `crypto`
 * modules and does NOT run on Cloudflare Workers / Vercel Edge Runtime.
 * This module talks to Razorpay's REST API directly via `fetch`, with
 * Basic-Auth signing done client-side. Identical surface to the SDK
 * (subscriptions.cancel, plans.create, payments.refund, etc.) so callers
 * upstream don't change.
 *
 * Keys: RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (set on Vercel/Cloudflare).
 * Test keys in staging — switch to live keys before charging real cards.
 *
 * Reference: https://razorpay.com/docs/api/
 */

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

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

  const authHeader = "Basic " + btoa(`${keyId}:${keySecret}`);

  async function call(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const res = await fetch(`${RAZORPAY_API_BASE}${path}`, {
      method,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try { json = text.length > 0 ? (JSON.parse(text) as Record<string, unknown>) : {}; }
    catch { /* leave json empty; caller will see error */ }
    if (!res.ok) {
      const errorMessage =
        (json["error"] as { description?: string } | undefined)?.description
        ?? `Razorpay ${method} ${path} failed: HTTP ${res.status}`;
      throw new Error(errorMessage);
    }
    return json;
  }

  _client = {
    plans: {
      create: (data) => call("POST", "/plans", data),
      fetch:  (id)   => call("GET",  `/plans/${encodeURIComponent(id)}`),
    },
    subscriptions: {
      // Razorpay's subscription cancel takes a body `{ cancel_at_cycle_end: 0|1 }`
      cancel: (id, cancelAtCycleEnd) =>
        call("POST", `/subscriptions/${encodeURIComponent(id)}/cancel`, {
          cancel_at_cycle_end: cancelAtCycleEnd === true ? 1 : 0,
        }),
      fetch:  (id) => call("GET", `/subscriptions/${encodeURIComponent(id)}`),
    },
    payments: {
      refund: (paymentId, data) =>
        call("POST", `/payments/${encodeURIComponent(paymentId)}/refund`, data),
      fetch:  (id) => call("GET", `/payments/${encodeURIComponent(id)}`),
    },
  };

  return _client;
}
