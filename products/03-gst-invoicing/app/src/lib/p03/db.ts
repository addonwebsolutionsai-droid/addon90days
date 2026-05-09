/**
 * TaxPilot — typed Supabase access.
 *
 * Every function here uses the service-role client because RLS is set to
 * deny-all for both `anon` and `authenticated` (see migration 011). Routes
 * authenticate the Clerk user upstream and pass the userId into queries
 * here, then we scope every read/write by `owner_clerk_user_id` so a user
 * can never see another user's data.
 *
 * Single source of truth for query shapes — routes import these helpers
 * instead of writing inline `p03Table("p03_x")` calls. That keeps the
 * authorization invariant local: if a function in this file scopes by
 * userId, every caller gets that scoping for free.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  P03Business,
  P03BusinessInsert,
  P03Customer,
  P03CustomerInsert,
  P03HsnCode,
  P03Invoice,
  P03InvoiceLine,
} from "./types";

/**
 * The shared Supabase client is typed against P01's Database, which doesn't
 * know about p03_ tables. Same situation as lib/p02/db.ts — we wrap with an
 * untyped table accessor so calls compile cleanly. When we generate full
 * Database types covering all products, drop this and use `supabaseAdmin`
 * directly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p03Table(tableName: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(tableName);
}

// ---------------------------------------------------------------------------
// Businesses
// ---------------------------------------------------------------------------

export async function listBusinesses(clerkUserId: string): Promise<P03Business[]> {
  const { data, error } = await p03Table("p03_businesses")
    .select("*")
    .eq("owner_clerk_user_id", clerkUserId)
    .order("created_at", { ascending: false });
  if (error !== null) throw new Error(`listBusinesses: ${error.message}`);
  return (data ?? []) as P03Business[];
}

export async function getBusiness(id: string, clerkUserId: string): Promise<P03Business | null> {
  const { data, error } = await p03Table("p03_businesses")
    .select("*")
    .eq("id", id)
    .eq("owner_clerk_user_id", clerkUserId)
    .maybeSingle();
  if (error !== null) throw new Error(`getBusiness: ${error.message}`);
  return (data ?? null) as P03Business | null;
}

export async function createBusiness(input: P03BusinessInsert): Promise<P03Business> {
  const { data, error } = await p03Table("p03_businesses")
    .insert(input)
    .select()
    .single();
  if (error !== null) throw new Error(`createBusiness: ${error.message}`);
  return data as P03Business;
}

/**
 * Atomically fetch the next invoice number for a business and increment the
 * counter. Uses a SELECT ... FOR UPDATE pattern via the rpc layer would be
 * cleaner; for the MVP we accept the race window — two simultaneous create-
 * invoice calls from the same user could produce duplicate numbers, but the
 * UNIQUE (business_id, invoice_number) constraint will reject the second one.
 */
export async function reserveNextInvoiceNumber(
  business: P03Business,
): Promise<string> {
  const next = business.next_invoice_number;
  const number = `${business.invoice_prefix}${String(next).padStart(4, "0")}`;
  const { error } = await p03Table("p03_businesses")
    .update({ next_invoice_number: next + 1 })
    .eq("id", business.id);
  if (error !== null) throw new Error(`reserveNextInvoiceNumber: ${error.message}`);
  return number;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function listCustomers(businessId: string, clerkUserId: string): Promise<P03Customer[]> {
  // Verify ownership first (cheap, single round-trip via business lookup).
  const business = await getBusiness(businessId, clerkUserId);
  if (business === null) return [];
  const { data, error } = await p03Table("p03_customers")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error !== null) throw new Error(`listCustomers: ${error.message}`);
  return (data ?? []) as P03Customer[];
}

export async function getCustomer(
  customerId: string,
  businessId: string,
  clerkUserId: string,
): Promise<P03Customer | null> {
  const business = await getBusiness(businessId, clerkUserId);
  if (business === null) return null;
  const { data, error } = await p03Table("p03_customers")
    .select("*")
    .eq("id", customerId)
    .eq("business_id", businessId)
    .maybeSingle();
  if (error !== null) throw new Error(`getCustomer: ${error.message}`);
  return (data ?? null) as P03Customer | null;
}

export async function createCustomer(input: P03CustomerInsert, clerkUserId: string): Promise<P03Customer> {
  // Authorization: the business must belong to the caller.
  const business = await getBusiness(input.business_id, clerkUserId);
  if (business === null) {
    throw new Error("createCustomer: business not found or not owned by user");
  }
  const { data, error } = await p03Table("p03_customers")
    .insert(input)
    .select()
    .single();
  if (error !== null) throw new Error(`createCustomer: ${error.message}`);
  return data as P03Customer;
}

// ---------------------------------------------------------------------------
// HSN / SAC autocomplete
// ---------------------------------------------------------------------------

export interface HsnSearchOptions {
  /** User-typed query — matched against code prefix and description (trgm). */
  query: string;
  /** Max results returned. Default 12. Cap 50. */
  limit?: number;
  /** Filter to common-only. UI default true; advanced search false. */
  commonOnly?: boolean;
}

export async function searchHsnCodes(opts: HsnSearchOptions): Promise<P03HsnCode[]> {
  const limit = Math.min(opts.limit ?? 12, 50);
  const q = opts.query.trim();

  // Empty query → return common defaults so the autocomplete pop-over has
  // something to show before the user types.
  if (q.length === 0) {
    const { data, error } = await p03Table("p03_hsn_codes")
      .select("*")
      .eq("is_common", true)
      .order("code")
      .limit(limit);
    if (error !== null) throw new Error(`searchHsnCodes: ${error.message}`);
    return (data ?? []) as P03HsnCode[];
  }

  // Substring search across code + description. We deliberately use ilike
  // here rather than the gin_trgm index because for short user inputs the
  // trgm threshold often misses obvious matches ("rice" → 1006). The trgm
  // index helps when we sort by similarity, which we'll add when the master
  // is loaded with 5000+ rows and ilike performance becomes a problem.
  const pattern = `%${q.replace(/[%_]/g, "\\$&")}%`;
  const filterCommon = opts.commonOnly === true ? "is_common.eq.true" : null;

  let queryBuilder = p03Table("p03_hsn_codes")
    .select("*")
    .or(`code.ilike.${pattern},description.ilike.${pattern}`)
    .order("is_common", { ascending: false }) // common rows first
    .order("code")
    .limit(limit);

  if (filterCommon !== null) {
    queryBuilder = queryBuilder.eq("is_common", true);
  }

  const { data, error } = await queryBuilder;
  if (error !== null) throw new Error(`searchHsnCodes: ${error.message}`);
  return (data ?? []) as P03HsnCode[];
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export async function listInvoices(businessId: string, clerkUserId: string): Promise<P03Invoice[]> {
  const business = await getBusiness(businessId, clerkUserId);
  if (business === null) return [];
  const { data, error } = await p03Table("p03_invoices")
    .select("*")
    .eq("business_id", businessId)
    .order("invoice_date", { ascending: false })
    .limit(200);
  if (error !== null) throw new Error(`listInvoices: ${error.message}`);
  return (data ?? []) as P03Invoice[];
}

export interface InvoiceWithLines {
  invoice: P03Invoice;
  lines:   P03InvoiceLine[];
}

export async function getInvoiceWithLines(
  invoiceId: string,
  businessId: string,
  clerkUserId: string,
): Promise<InvoiceWithLines | null> {
  const business = await getBusiness(businessId, clerkUserId);
  if (business === null) return null;
  const { data: invoice, error: invErr } = await p03Table("p03_invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("business_id", businessId)
    .maybeSingle();
  if (invErr !== null) throw new Error(`getInvoice: ${invErr.message}`);
  if (invoice === null) return null;

  const { data: lines, error: linesErr } = await p03Table("p03_invoice_lines")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("line_number");
  if (linesErr !== null) throw new Error(`getInvoiceLines: ${linesErr.message}`);

  return {
    invoice: invoice as P03Invoice,
    lines:   (lines ?? []) as P03InvoiceLine[],
  };
}

/**
 * Insert an invoice header + all its lines as separate operations. We do NOT
 * run this inside a Postgres transaction yet because Supabase's PostgREST
 * doesn't expose multi-statement transactions over the standard endpoint;
 * if the lines insert fails halfway, we're left with a header row with no
 * lines. The caller should treat a partial-insert as failure and the cleanup
 * job (later, not yet built) will sweep header rows where no lines exist
 * after a 5-minute grace period.
 */
export async function insertInvoiceWithLines(
  invoiceRow: Omit<P03Invoice, "id" | "created_at" | "updated_at">,
  lines: Array<Omit<P03InvoiceLine, "id" | "invoice_id" | "created_at">>,
): Promise<InvoiceWithLines> {

  const { data: invoice, error: invErr } = await p03Table("p03_invoices")
    .insert(invoiceRow)
    .select()
    .single();
  if (invErr !== null) throw new Error(`insertInvoice: ${invErr.message}`);

  const lineRows = lines.map((l) => ({ ...l, invoice_id: (invoice as P03Invoice).id }));
  const { data: insertedLines, error: linesErr } = await p03Table("p03_invoice_lines")
    .insert(lineRows)
    .select();
  if (linesErr !== null) {
    // Best-effort rollback — delete the orphan header.
    await p03Table("p03_invoices").delete().eq("id", (invoice as P03Invoice).id);
    throw new Error(`insertInvoiceLines: ${linesErr.message}`);
  }

  return {
    invoice: invoice as P03Invoice,
    lines:   (insertedLines ?? []) as P03InvoiceLine[],
  };
}
