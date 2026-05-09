// AUTO-SYNCED FROM packages/billing/src/db.ts — DO NOT EDIT THIS COPY.
// Edit upstream and run `node scripts/sync-libs.mjs` to propagate to all products.
// Last synced: 2026-05-09T12:04:29.499Z
/**
 * Billing layer — database helpers.
 *
 * All writes use the service-role client (bypasses RLS).
 * Tables: billing_plans, billing_subscriptions, billing_invoices,
 *         billing_refund_requests.
 *
 * Note: Supabase client is typed for the P01 schema.
 * Billing tables use the same untyped wrapper as lib/p02/db.ts + lib/p03/db.ts.
 * When a unified Database type is generated, remove the casts.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRazorpayClient } from "./razorpay-client";

// ---------------------------------------------------------------------------
// Untyped table wrapper (same pattern as p02table / p03table)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function billingTable(tableName: string): ReturnType<ReturnType<typeof createClient>["from"]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(tableName);
}

// ---------------------------------------------------------------------------
// Types (local — no shared generated types yet)
// ---------------------------------------------------------------------------

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "paused" | "trialing";
export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "failed"
  | "void";
export type RefundStatus = "pending" | "approved" | "rejected" | "processed";

export interface BillingPlan {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  price_monthly_inr: number;
  price_yearly_inr: number | null;
  features: string[];
  entitlements: Record<string, unknown>;
  razorpay_plan_id_monthly: string | null;
  razorpay_plan_id_yearly: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BillingSubscription {
  id: string;
  clerk_user_id: string;
  product_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingInvoice {
  id: string;
  subscription_id: string;
  clerk_user_id: string;
  product_id: string;
  razorpay_invoice_id: string | null;
  razorpay_payment_id: string | null;
  amount_inr: number;
  tax_amount_inr: number;
  total_inr: number;
  status: InvoiceStatus;
  issued_at: string;
  paid_at: string | null;
  due_at: string | null;
  pdf_url: string | null;
  line_items: unknown[];
  created_at: string;
  updated_at: string;
}

export interface BillingRefundRequest {
  id: string;
  invoice_id: string;
  subscription_id: string;
  clerk_user_id: string;
  amount_inr: number;
  reason: string;
  requested_by_clerk_user_id: string;
  status: RefundStatus;
  razorpay_refund_id: string | null;
  processed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export async function listPlans(productId?: string): Promise<BillingPlan[]> {
  let q = billingTable("billing_plans")
    .select("*")
    .order("product_id")
    .order("sort_order");

  if (productId !== undefined) {
    q = q.eq("product_id", productId);
  }

  const { data, error } = await q;
  if (error !== null || data === null) {
    throw new Error(`listPlans failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingPlan[];
}

export async function getPlan(id: string): Promise<BillingPlan | null> {
  const { data } = await billingTable("billing_plans").select("*").eq("id", id).single();
  return (data as BillingPlan | null) ?? null;
}

export interface CreatePlanInput {
  product_id: string;
  name: string;
  slug: string;
  price_monthly_inr: number;
  price_yearly_inr?: number;
  features?: string[];
  entitlements?: Record<string, unknown>;
  sort_order?: number;
}

export async function createPlan(input: CreatePlanInput): Promise<BillingPlan> {
  const { data, error } = await billingTable("billing_plans")
    .insert({
      product_id: input.product_id,
      name: input.name,
      slug: input.slug,
      price_monthly_inr: input.price_monthly_inr,
      price_yearly_inr: input.price_yearly_inr ?? null,
      features: input.features ?? [],
      entitlements: input.entitlements ?? {},
      sort_order: input.sort_order ?? 0,
      is_active: true,
    })
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`createPlan failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingPlan;
}

export interface UpdatePlanPatch {
  name?: string;
  price_monthly_inr?: number;
  price_yearly_inr?: number | null;
  features?: string[];
  entitlements?: Record<string, unknown>;
  sort_order?: number;
}

export async function updatePlan(id: string, patch: UpdatePlanPatch): Promise<BillingPlan> {
  const { data, error } = await billingTable("billing_plans")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`updatePlan failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingPlan;
}

export async function togglePlanActive(id: string, active: boolean): Promise<BillingPlan> {
  const { data, error } = await billingTable("billing_plans")
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`togglePlanActive failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingPlan;
}

export async function setRazorpayPlanIds(
  id: string,
  monthly: string,
  yearly: string | null
): Promise<BillingPlan> {
  const { data, error } = await billingTable("billing_plans")
    .update({
      razorpay_plan_id_monthly: monthly,
      razorpay_plan_id_yearly: yearly,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`setRazorpayPlanIds failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingPlan;
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export interface ListSubscriptionsFilter {
  productId?: string;
  status?: SubscriptionStatus;
  clerkUserId?: string;
  limit?: number;
}

export async function listSubscriptions(
  filter: ListSubscriptionsFilter
): Promise<BillingSubscription[]> {
  let q = billingTable("billing_subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filter.limit ?? 50);

  if (filter.productId !== undefined) q = q.eq("product_id", filter.productId);
  if (filter.status !== undefined) q = q.eq("status", filter.status);
  if (filter.clerkUserId !== undefined) q = q.eq("clerk_user_id", filter.clerkUserId);

  const { data, error } = await q;
  if (error !== null || data === null) {
    throw new Error(`listSubscriptions failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingSubscription[];
}

export async function getSubscription(id: string): Promise<BillingSubscription | null> {
  const { data } = await billingTable("billing_subscriptions").select("*").eq("id", id).single();
  return (data as BillingSubscription | null) ?? null;
}

export async function cancelSubscription(id: string, reason: string): Promise<BillingSubscription> {
  const sub = await getSubscription(id);
  if (sub === null) throw new Error(`Subscription ${id} not found`);

  // Cancel on Razorpay if subscription is active on their side
  if (sub.razorpay_subscription_id !== null) {
    try {
      const rzp = getRazorpayClient();
      await rzp.subscriptions.cancel(sub.razorpay_subscription_id, false);
    } catch (err) {
      // Surface error but still update DB — admin can retry Razorpay side
      console.warn(
        `cancelSubscription: Razorpay cancel failed for ${sub.razorpay_subscription_id}:`,
        (err as Error).message
      );
    }
  }

  const { data, error } = await billingTable("billing_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`cancelSubscription DB update failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingSubscription;
}

export async function pauseSubscription(id: string): Promise<BillingSubscription> {
  // Razorpay subscription pause is available on their dashboard / API v2.
  // For now we only update our DB — wire Razorpay call when needed.
  const { data, error } = await billingTable("billing_subscriptions")
    .update({ status: "paused", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`pauseSubscription failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingSubscription;
}

export async function resumeSubscription(id: string): Promise<BillingSubscription> {
  const { data, error } = await billingTable("billing_subscriptions")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`resumeSubscription failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingSubscription;
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export interface ListInvoicesFilter {
  productId?: string;
  status?: InvoiceStatus;
  clerkUserId?: string;
  limit?: number;
}

export async function listInvoices(filter: ListInvoicesFilter): Promise<BillingInvoice[]> {
  let q = billingTable("billing_invoices")
    .select("*")
    .order("issued_at", { ascending: false })
    .limit(filter.limit ?? 50);

  if (filter.productId !== undefined) q = q.eq("product_id", filter.productId);
  if (filter.status !== undefined) q = q.eq("status", filter.status);
  if (filter.clerkUserId !== undefined) q = q.eq("clerk_user_id", filter.clerkUserId);

  const { data, error } = await q;
  if (error !== null || data === null) {
    throw new Error(`listInvoices failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingInvoice[];
}

export async function getInvoice(id: string): Promise<BillingInvoice | null> {
  const { data } = await billingTable("billing_invoices").select("*").eq("id", id).single();
  return (data as BillingInvoice | null) ?? null;
}

// ---------------------------------------------------------------------------
// Refund Requests
// ---------------------------------------------------------------------------

export interface ListRefundRequestsFilter {
  status?: RefundStatus;
  limit?: number;
}

export async function listRefundRequests(
  filter: ListRefundRequestsFilter
): Promise<BillingRefundRequest[]> {
  let q = billingTable("billing_refund_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filter.limit ?? 50);

  if (filter.status !== undefined) q = q.eq("status", filter.status);

  const { data, error } = await q;
  if (error !== null || data === null) {
    throw new Error(`listRefundRequests failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingRefundRequest[];
}

export interface CreateRefundRequestInput {
  invoice_id: string;
  subscription_id: string;
  clerk_user_id: string;
  amount_inr: number;
  reason: string;
  requested_by_clerk_user_id: string;
}

export async function createRefundRequest(
  input: CreateRefundRequestInput
): Promise<BillingRefundRequest> {
  const { data, error } = await billingTable("billing_refund_requests")
    .insert({ ...input, status: "pending" })
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`createRefundRequest failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingRefundRequest;
}

export async function approveRefund(
  id: string,
  processedByClerkUserId: string
): Promise<BillingRefundRequest> {
  const { data, error } = await billingTable("billing_refund_requests")
    .update({
      status: "approved",
      notes: `Approved by ${processedByClerkUserId}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`approveRefund failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingRefundRequest;
}

export async function rejectRefund(
  id: string,
  processedByClerkUserId: string,
  notes: string
): Promise<BillingRefundRequest> {
  const { data, error } = await billingTable("billing_refund_requests")
    .update({
      status: "rejected",
      notes: `Rejected by ${processedByClerkUserId}: ${notes}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error !== null || data === null) {
    throw new Error(`rejectRefund failed: ${(error as Error | null)?.message ?? "no data"}`);
  }
  return data as BillingRefundRequest;
}

/**
 * processRefund — execute the Razorpay refund for an approved request.
 *
 * Calls Razorpay POST /v1/payments/{payment_id}/refund (amount in paise).
 * Saves razorpay_refund_id, marks request as 'processed'.
 * Updates invoice status to 'refunded' or 'partially_refunded' based on
 * whether the refund amount equals the invoice total.
 */
export async function processRefund(refundRequestId: string): Promise<BillingRefundRequest> {
  // 1. Load refund request
  const { data: rr } = await billingTable("billing_refund_requests")
    .select("*")
    .eq("id", refundRequestId)
    .single();

  if (rr === null) throw new Error(`Refund request ${refundRequestId} not found`);
  const request = rr as BillingRefundRequest;

  if (request.status !== "approved") {
    throw new Error(`Refund request ${refundRequestId} is not in 'approved' state (current: ${request.status})`);
  }

  // 2. Load the linked invoice to get the Razorpay payment ID
  const invoice = await getInvoice(request.invoice_id);
  if (invoice === null) throw new Error(`Invoice ${request.invoice_id} not found`);

  if (invoice.razorpay_payment_id === null) {
    throw new Error(
      `Invoice ${invoice.id} has no razorpay_payment_id — cannot refund. ` +
        "If this is a free/beta invoice, process the refund manually."
    );
  }

  // 3. Call Razorpay — amount in paise (× 100)
  const amountPaise = Math.round(request.amount_inr * 100);
  const rzp = getRazorpayClient();
  const rzpRefund = await rzp.payments.refund(invoice.razorpay_payment_id, {
    amount: amountPaise,
    speed: "normal",
    notes: { reason: request.reason, refund_request_id: refundRequestId },
  });

  const razorpayRefundId = String(rzpRefund["id"] ?? "");

  // 4. Mark request as processed
  const now = new Date().toISOString();
  const { data: updatedRr, error: rrErr } = await billingTable("billing_refund_requests")
    .update({
      status: "processed",
      razorpay_refund_id: razorpayRefundId,
      processed_at: now,
      updated_at: now,
    })
    .eq("id", refundRequestId)
    .select("*")
    .single();

  if (rrErr !== null || updatedRr === null) {
    throw new Error(`processRefund DB update failed: ${(rrErr as Error | null)?.message ?? "no data"}`);
  }

  // 5. Update invoice status
  const isFullRefund = request.amount_inr >= invoice.total_inr;
  await billingTable("billing_invoices")
    .update({
      status: isFullRefund ? "refunded" : "partially_refunded",
      updated_at: now,
    })
    .eq("id", invoice.id);

  return updatedRr as BillingRefundRequest;
}
