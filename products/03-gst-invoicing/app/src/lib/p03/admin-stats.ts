/**
 * P03 TaxPilot — admin dashboard data loaders.
 *
 * Mirror of lib/p02/admin-stats.ts. Service-role queries; admin sees
 * everything across all owners. Auth gate is enforced upstream by the
 * page layout.tsx.
 *
 * Single Promise.all() returns the full dashboard panel set so the page
 * loads in one round-trip.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function p03(table: string): any {
  return (getSupabaseAdmin() as unknown as ReturnType<typeof createClient>).from(table);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaxpilotAdminKpis {
  totalBusinesses:        number;
  totalCustomers:         number;
  totalInvoices:          number;
  invoicesToday:          number;
  /** Sum of total_amount across all invoices, all-time. */
  grossInvoicedAllTime:   number;
  /** Sum of total_amount in last 7 days. */
  grossInvoiced7d:        number;
  /** Sum of paid_amount across all invoices. */
  totalCollected:         number;
  /** total_amount - paid_amount across all non-cancelled invoices. */
  outstandingAllTime:     number;
}

export interface BusinessAdminRow {
  id:                  string;
  legal_name:          string;
  trade_name:          string | null;
  owner_clerk_user_id: string;
  gstin:               string | null;
  state_name:          string;
  gst_scheme:          string;
  invoice_count:       number;
  /** Sum of total_amount across this business's invoices. */
  total_invoiced:      number;
  /** Sum of paid_amount across this business's invoices. */
  total_paid:          number;
  /** Date of most recent invoice (or null if none). */
  last_invoice_at:     string | null;
  created_at:          string;
}

export interface InvoiceAdminRow {
  id:              string;
  business_id:     string;
  business_name:   string;
  invoice_number:  string;
  customer_id:     string;
  customer_name:   string;
  status:          string;
  supply_type:     string;
  invoice_date:    string;
  total_amount:    number;
  paid_amount:     number;
  created_at:      string;
}

export interface TaxpilotAdminDashboardData {
  kpis:               TaxpilotAdminKpis;
  businesses:         BusinessAdminRow[];
  recentInvoices:     InvoiceAdminRow[];
  /** Aggregated by gst_scheme — useful for at-a-glance scheme distribution. */
  schemeBreakdown:    Array<{ scheme: string; count: number; gross: number }>;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

const todayStartUtc = (): string => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

const sevenDaysAgoUtc = (): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString();
};

export async function loadTaxpilotAdminDashboard(): Promise<TaxpilotAdminDashboardData> {
  const todayStart = todayStartUtc();
  const sevenDays  = sevenDaysAgoUtc();

  const [
    businessesRes,
    customersCountRes,
    invoicesAllRes,
    invoicesTodayRes,
    invoicesAllTimeAggRes,
    invoices7dAggRes,
    recentInvoicesRes,
  ] = await Promise.all([
    p03("p03_businesses")
      .select("id, legal_name, trade_name, owner_clerk_user_id, gstin, state_name, gst_scheme, created_at")
      .order("created_at", { ascending: false })
      .limit(100),

    p03("p03_customers").select("id", { count: "exact", head: true }),

    p03("p03_invoices").select("id", { count: "exact", head: true }),
    p03("p03_invoices").select("id", { count: "exact", head: true }).gte("created_at", todayStart),

    // Pull all invoice money columns in one shot — admin scope is small enough
    // that the row scan is cheap. If this grows we'll switch to a SQL aggregate.
    p03("p03_invoices")
      .select("business_id, total_amount, paid_amount, status")
      .neq("status", "cancelled"),

    p03("p03_invoices")
      .select("total_amount")
      .gte("created_at", sevenDays)
      .neq("status", "cancelled"),

    p03("p03_invoices")
      .select("id, business_id, customer_id, invoice_number, status, supply_type, invoice_date, total_amount, paid_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const totalBusinesses = (businessesRes.data ?? []).length;
  const totalCustomers  = customersCountRes.count ?? 0;
  const totalInvoices   = invoicesAllRes.count ?? 0;
  const invoicesToday   = invoicesTodayRes.count ?? 0;

  // Aggregate money columns
  const allRows = (invoicesAllTimeAggRes.data ?? []) as Array<{
    business_id: string; total_amount: string | number; paid_amount: string | number; status: string;
  }>;

  let grossInvoicedAllTime = 0;
  let totalCollected       = 0;
  let outstandingAllTime   = 0;
  for (const r of allRows) {
    const t = Number(r.total_amount);
    const p = Number(r.paid_amount);
    grossInvoicedAllTime += t;
    totalCollected       += p;
    outstandingAllTime   += (t - p);
  }

  const sevenDayRows = (invoices7dAggRes.data ?? []) as Array<{ total_amount: string | number }>;
  const grossInvoiced7d = sevenDayRows.reduce((s, r) => s + Number(r.total_amount), 0);

  // ---- Business enrichment: invoice count + total_invoiced + last invoice date
  const businessRows = (businessesRes.data ?? []) as Array<{
    id: string; legal_name: string; trade_name: string | null; owner_clerk_user_id: string;
    gstin: string | null; state_name: string; gst_scheme: string; created_at: string;
  }>;

  // Aggregate per business in one pass over the already-fetched invoice rows
  const perBiz = new Map<string, { count: number; gross: number; paid: number }>();
  for (const r of allRows) {
    const cur = perBiz.get(r.business_id) ?? { count: 0, gross: 0, paid: 0 };
    cur.count += 1;
    cur.gross += Number(r.total_amount);
    cur.paid  += Number(r.paid_amount);
    perBiz.set(r.business_id, cur);
  }

  // Last invoice date per business — separate query, single round-trip
  const lastInvoiceDate = new Map<string, string>();
  if (businessRows.length > 0) {
    const ids = businessRows.map((b) => b.id);
    const { data } = await p03("p03_invoices")
      .select("business_id, invoice_date")
      .in("business_id", ids)
      .order("invoice_date", { ascending: false });
    for (const row of (data ?? []) as Array<{ business_id: string; invoice_date: string }>) {
      if (!lastInvoiceDate.has(row.business_id)) {
        lastInvoiceDate.set(row.business_id, row.invoice_date);
      }
    }
  }

  const businesses: BusinessAdminRow[] = businessRows.map((b) => {
    const stats = perBiz.get(b.id) ?? { count: 0, gross: 0, paid: 0 };
    return {
      id:                  b.id,
      legal_name:          b.legal_name,
      trade_name:          b.trade_name,
      owner_clerk_user_id: b.owner_clerk_user_id,
      gstin:               b.gstin,
      state_name:          b.state_name,
      gst_scheme:          b.gst_scheme,
      invoice_count:       stats.count,
      total_invoiced:      stats.gross,
      total_paid:          stats.paid,
      last_invoice_at:     lastInvoiceDate.get(b.id) ?? null,
      created_at:          b.created_at,
    };
  });

  // ---- Scheme breakdown
  const schemeMap = new Map<string, { count: number; gross: number }>();
  for (const b of businessRows) {
    const stats = perBiz.get(b.id) ?? { count: 0, gross: 0, paid: 0 };
    const cur = schemeMap.get(b.gst_scheme) ?? { count: 0, gross: 0 };
    cur.count += 1;
    cur.gross += stats.gross;
    schemeMap.set(b.gst_scheme, cur);
  }
  const schemeBreakdown = Array.from(schemeMap.entries())
    .map(([scheme, v]) => ({ scheme, ...v }))
    .sort((a, b) => b.count - a.count);

  // ---- Recent invoices enrichment (business + customer names)
  const invoiceRows = (recentInvoicesRes.data ?? []) as Array<{
    id: string; business_id: string; customer_id: string; invoice_number: string;
    status: string; supply_type: string; invoice_date: string;
    total_amount: string | number; paid_amount: string | number; created_at: string;
  }>;

  const businessNameById = new Map(businessRows.map((b) => [b.id, b.legal_name]));

  const customerIds = Array.from(new Set(invoiceRows.map((i) => i.customer_id)));
  const customerLookupRes = customerIds.length > 0
    ? await p03("p03_customers").select("id, name").in("id", customerIds)
    : { data: [] };
  const customerNameById = new Map(
    ((customerLookupRes.data ?? []) as Array<{ id: string; name: string }>).map((c) => [c.id, c.name]),
  );

  const recentInvoices: InvoiceAdminRow[] = invoiceRows.map((i) => ({
    id:              i.id,
    business_id:     i.business_id,
    business_name:   businessNameById.get(i.business_id) ?? "(unknown)",
    invoice_number:  i.invoice_number,
    customer_id:     i.customer_id,
    customer_name:   customerNameById.get(i.customer_id) ?? "(unknown)",
    status:          i.status,
    supply_type:     i.supply_type,
    invoice_date:    i.invoice_date,
    total_amount:    Number(i.total_amount),
    paid_amount:     Number(i.paid_amount),
    created_at:      i.created_at,
  }));

  return {
    kpis: {
      totalBusinesses,
      totalCustomers,
      totalInvoices,
      invoicesToday,
      grossInvoicedAllTime,
      grossInvoiced7d,
      totalCollected,
      outstandingAllTime,
    },
    businesses: businesses.sort((a, b) => b.total_invoiced - a.total_invoiced),
    recentInvoices,
    schemeBreakdown,
  };
}
