/**
 * TaxPilot — shared TypeScript types.
 *
 * Mirrors the Postgres schema in supabase/migrations/011_p03_taxpilot.sql.
 * One change to the schema → one change here. Routes and components import
 * from this file rather than re-deriving the shape inline.
 */

export type GstScheme       = "regular" | "composition" | "unregistered";
export type InvoiceKind     = "tax_invoice" | "bill_of_supply" | "export_invoice" | "credit_note" | "debit_note";
export type InvoiceStatus   = "draft" | "sent" | "paid" | "partially_paid" | "cancelled";
export type SupplyType      = "intra_state" | "inter_state" | "export";
export type HsnKind         = "hsn" | "sac";

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export interface P03Business {
  id:                       string;
  owner_clerk_user_id:      string;
  legal_name:               string;
  trade_name:               string | null;
  gstin:                    string | null;
  pan:                      string | null;
  state_code:               string;
  state_name:               string;
  address_line1:            string | null;
  address_line2:            string | null;
  city:                     string | null;
  pincode:                  string | null;
  email:                    string | null;
  phone:                    string | null;
  gst_scheme:               GstScheme;
  composition_rate_percent: number | null;
  invoice_prefix:           string;
  next_invoice_number:      number;
  logo_url:                 string | null;
  bank_ifsc:                string | null;
  default_terms:            string | null;
  created_at:               string;
  updated_at:               string;
}

export interface P03Customer {
  id:                          string;
  business_id:                 string;
  name:                        string;
  email:                       string | null;
  phone:                       string | null;
  gstin:                       string | null;
  place_of_supply_state_code:  string;
  place_of_supply_state_name:  string;
  address_line1:               string | null;
  address_line2:               string | null;
  city:                        string | null;
  pincode:                     string | null;
  country_code:                string;
  notes:                       string | null;
  created_at:                  string;
  updated_at:                  string;
}

export interface P03HsnCode {
  code:             string;
  kind:             HsnKind;
  description:      string;
  gst_rate_percent: number;
  category:         string | null;
  is_common:        boolean;
}

export interface P03Invoice {
  id:                string;
  business_id:       string;
  customer_id:       string;
  invoice_number:    string;
  invoice_kind:      InvoiceKind;
  status:            InvoiceStatus;
  supply_type:       SupplyType;
  invoice_date:      string;          // YYYY-MM-DD
  due_date:          string | null;
  reverse_charge:    boolean;
  notes:             string | null;
  terms:             string | null;
  subtotal_amount:   number;
  discount_amount:   number;
  cgst_amount:       number;
  sgst_amount:       number;
  igst_amount:       number;
  cess_amount:       number;
  round_off_amount:  number;
  total_amount:      number;
  paid_amount:       number;
  irn:               string | null;
  irn_signed_qr:     string | null;
  irn_ack_no:        string | null;
  irn_ack_date:      string | null;
  pdf_storage_path:  string | null;
  created_at:        string;
  updated_at:        string;
}

export interface P03InvoiceLine {
  id:                string;
  invoice_id:        string;
  line_number:       number;
  item_description:  string;
  hsn_code:          string;
  unit:              string;
  quantity:          number;
  unit_price:        number;
  discount_percent:  number;
  taxable_amount:    number;
  gst_rate_percent:  number;
  cgst_amount:       number;
  sgst_amount:       number;
  igst_amount:       number;
  cess_rate_percent: number;
  cess_amount:       number;
  line_total:        number;
  created_at:        string;
}

// ---------------------------------------------------------------------------
// Insert payload shapes (subset of full row, omits auto-set + computed fields)
// ---------------------------------------------------------------------------

export type P03BusinessInsert = Omit<P03Business,
  "id" | "next_invoice_number" | "created_at" | "updated_at"
> & { next_invoice_number?: number };

export type P03CustomerInsert = Omit<P03Customer,
  "id" | "created_at" | "updated_at"
>;

/**
 * The line shape the create-invoice route accepts. Tax fields are computed
 * server-side via lib/p03/gst-calc.ts so the client can't write a bogus
 * tax breakdown.
 */
export interface P03InvoiceLineDraft {
  item_description:  string;
  hsn_code:          string;
  unit?:             string;        // defaults to "NOS"
  quantity:          number;
  unit_price:        number;
  discount_percent?: number;        // defaults to 0
  gst_rate_percent:  number;
  cess_rate_percent?: number;       // defaults to 0
}

export interface P03InvoiceDraft {
  customer_id:    string;
  invoice_kind?:  InvoiceKind;      // defaults to "tax_invoice"
  invoice_date?:  string;           // YYYY-MM-DD; defaults to today
  due_date?:      string | null;
  reverse_charge?: boolean;
  notes?:         string | null;
  terms?:         string | null;
  lines:          P03InvoiceLineDraft[];
}

// ---------------------------------------------------------------------------
// 2-digit Indian state codes — used for intra/inter-state classification.
// Source: GSTN portal's official list. Kept here as a const so UI dropdowns
// and the calc engine never disagree on what's valid.
// ---------------------------------------------------------------------------

export const INDIAN_STATES: readonly { code: string; name: string }[] = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman and Diu" },
  { code: "26", name: "Dadra and Nagar Haveli" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh (Old)" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
];

const STATE_CODE_SET = new Set(INDIAN_STATES.map((s) => s.code));
export function isValidStateCode(code: string): boolean {
  return STATE_CODE_SET.has(code);
}
export function stateNameByCode(code: string): string | null {
  return INDIAN_STATES.find((s) => s.code === code)?.name ?? null;
}
