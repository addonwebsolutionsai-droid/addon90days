/**
 * TaxPilot — GST calculation engine.
 *
 * Pure functions, no external IO. Every function takes plain inputs and
 * returns plain outputs so the suite is fully unit-testable without a DB,
 * a Clerk session, or the GSTN portal.
 *
 * Design rules (from products/03-gst-invoicing/.claude/CLAUDE.md):
 *   - Intra-state (same state buyer + seller): split into CGST + SGST,
 *     each at half the GST rate.
 *   - Inter-state (different states):           single IGST at full rate.
 *   - Export (country != IN):                    zero-rated (IGST 0%, claim refund).
 *   - Composition scheme:                        no ITC, no separate tax line on
 *                                                invoice; flat rate on turnover.
 *   - Reverse charge:                            invoice issued by buyer; tax
 *                                                shown but not collected by seller.
 *
 * All money is rounded to 2 decimal places using Indian half-up convention
 * (round 0.5 away from zero). Numeric storage is `NUMERIC(14,2)` in Postgres
 * which matches.
 *
 * NOT covered here (deferred to Phase 2 with GSP integration):
 *   - GSTIN format validation (cross-checked via GSTN API)
 *   - Cess on demerit goods (28% slab additions)
 *   - TDS/TCS deductions
 *   - SEZ supplies with bond/LUT
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Legal supply classification. Drives whether tax splits CGST/SGST or IGST. */
export type SupplyType = "intra_state" | "inter_state" | "export";

/** Indian GST registration scheme. */
export type GstScheme = "regular" | "composition" | "unregistered";

export interface PartyLocation {
  /** 2-digit Indian state code (e.g. "24" Gujarat, "27" Maharashtra). */
  stateCode: string;
  /** ISO-2 country code; non-IN = export (zero-rated). */
  countryCode: string; // "IN" | "US" | ...
}

export interface LineInput {
  quantity:        number;
  unitPrice:       number;
  /** 0-100 line-level discount applied to quantity*unitPrice. */
  discountPercent: number;
  /** GST rate snapshot in percent (e.g. 18 for 18% slab). */
  gstRatePercent:  number;
  /** Cess rate, usually 0 except for demerit goods (cars, tobacco, aerated drinks). */
  cessRatePercent?: number;
}

export interface LineComputed {
  taxableAmount:    number; // quantity * unit_price * (1 - discount/100)
  cgstAmount:       number;
  sgstAmount:       number;
  igstAmount:       number;
  cessAmount:       number;
  lineTotal:        number; // taxable + all taxes
}

export interface InvoiceTotals {
  subtotalAmount:  number; // sum of taxable across lines
  cgstAmount:      number;
  sgstAmount:      number;
  igstAmount:      number;
  cessAmount:      number;
  /** Round-off so the final total is a clean rupee value. Can be negative. */
  roundOffAmount:  number;
  totalAmount:     number; // subtotal + cgst + sgst + igst + cess + round_off
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Round to 2 decimals using Indian/CBIC convention: half-up (away from zero).
 * JavaScript's Math.round uses banker's rounding for some negative cases —
 * we use a manual implementation to match what tax officers expect.
 */
export function round2(value: number): number {
  const factor = 100;
  return Math.sign(value) * Math.round(Math.abs(value) * factor) / factor;
}

/**
 * Round to nearest rupee for display. Used for invoice grand-total when
 * the user has enabled "round-off to rupee" preference.
 */
export function roundToRupee(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

/**
 * Determine supply type from seller and buyer location.
 * Country mismatch wins: any non-IN buyer is an export, regardless of state.
 */
export function classifySupply(seller: PartyLocation, buyer: PartyLocation): SupplyType {
  if (buyer.countryCode !== "IN" || seller.countryCode !== "IN") return "export";
  if (seller.stateCode === buyer.stateCode) return "intra_state";
  return "inter_state";
}

// ---------------------------------------------------------------------------
// Line-level calculation
// ---------------------------------------------------------------------------

/**
 * Compute the per-line tax breakdown.
 *
 * Composition-scheme sellers do NOT charge separate GST on the invoice — they
 * pay a flat rate on their turnover instead. Pass scheme="composition" and
 * the function will zero out cgst/sgst/igst on the line. The taxable_amount
 * still gets computed normally (it's what the composition rate is later
 * applied against, separately).
 *
 * Reverse charge: seller still computes the tax on the invoice but the buyer
 * pays it. We compute the same tax fields — the "reverse charge" flag lives
 * on the invoice header, not the line.
 */
export function computeLine(
  line:         LineInput,
  supplyType:   SupplyType,
  scheme:       GstScheme = "regular",
): LineComputed {
  if (line.quantity <= 0)        throw new Error("quantity must be > 0");
  if (line.unitPrice < 0)        throw new Error("unitPrice must be >= 0");
  if (line.discountPercent < 0 || line.discountPercent > 100)
    throw new Error("discountPercent must be 0-100");
  if (line.gstRatePercent < 0)   throw new Error("gstRatePercent must be >= 0");

  const grossLine     = line.quantity * line.unitPrice;
  const discountValue = grossLine * (line.discountPercent / 100);
  const taxableAmount = round2(grossLine - discountValue);

  // Composition + unregistered: no per-line tax on the invoice.
  if (scheme !== "regular") {
    return {
      taxableAmount,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      cessAmount: 0,
      lineTotal:  taxableAmount,
    };
  }

  // Export: zero-rated. Can be with-LUT (no tax charged) or with-bond (IGST
  // charged, refunded later). Default behavior here: zero-rated, no tax —
  // the with-bond variant is set explicitly by the caller via a flag in a
  // future revision. For now: keep it simple.
  if (supplyType === "export") {
    return {
      taxableAmount,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      cessAmount: round2(taxableAmount * ((line.cessRatePercent ?? 0) / 100)),
      lineTotal:  round2(taxableAmount + round2(taxableAmount * ((line.cessRatePercent ?? 0) / 100))),
    };
  }

  const cessAmount = round2(taxableAmount * ((line.cessRatePercent ?? 0) / 100));

  if (supplyType === "intra_state") {
    const halfRate    = line.gstRatePercent / 2;
    const cgstAmount  = round2(taxableAmount * (halfRate / 100));
    const sgstAmount  = round2(taxableAmount * (halfRate / 100));
    return {
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      cessAmount,
      lineTotal:  round2(taxableAmount + cgstAmount + sgstAmount + cessAmount),
    };
  }

  // inter_state
  const igstAmount = round2(taxableAmount * (line.gstRatePercent / 100));
  return {
    taxableAmount,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount,
    cessAmount,
    lineTotal:  round2(taxableAmount + igstAmount + cessAmount),
  };
}

// ---------------------------------------------------------------------------
// Invoice-level totals
// ---------------------------------------------------------------------------

export interface InvoiceTotalsInput {
  /** Already-computed line totals (use computeLine on each first). */
  lines:                   LineComputed[];
  /** Header-level discount applied AFTER line totals (rare; usually 0). */
  discountAmount?:         number;
  /** Whether to round the grand total to the nearest rupee. Default: true. */
  roundOffToNearestRupee?: boolean;
}

export function computeInvoiceTotals(input: InvoiceTotalsInput): InvoiceTotals {
  const { lines, discountAmount = 0, roundOffToNearestRupee = true } = input;

  let subtotal = 0, cgst = 0, sgst = 0, igst = 0, cess = 0;
  for (const l of lines) {
    subtotal += l.taxableAmount;
    cgst     += l.cgstAmount;
    sgst     += l.sgstAmount;
    igst     += l.igstAmount;
    cess     += l.cessAmount;
  }
  subtotal = round2(subtotal);
  cgst     = round2(cgst);
  sgst     = round2(sgst);
  igst     = round2(igst);
  cess     = round2(cess);

  const preRound = round2(subtotal - discountAmount + cgst + sgst + igst + cess);
  const total    = roundOffToNearestRupee ? roundToRupee(preRound) : preRound;
  const roundOff = round2(total - preRound);

  return {
    subtotalAmount: subtotal,
    cgstAmount:     cgst,
    sgstAmount:     sgst,
    igstAmount:     igst,
    cessAmount:     cess,
    roundOffAmount: roundOff,
    totalAmount:    total,
  };
}

// ---------------------------------------------------------------------------
// GSTIN format check (no GSTN-portal lookup — that's Phase 2)
// ---------------------------------------------------------------------------

/**
 * Validate the structural format of a GSTIN: 15 alphanumeric chars,
 *   - chars 1-2:   2-digit state code
 *   - chars 3-12:  10-char PAN of the registrant
 *   - char 13:     entity number for that PAN within the state
 *   - char 14:     "Z" by default (reserved)
 *   - char 15:     check digit
 *
 * This validates structure only. Cross-checking against the GSTN API
 * (active registration, legal name, address) requires GSP credentials
 * and lands in Phase 2.
 */
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function isValidGstinFormat(gstin: string): boolean {
  return GSTIN_PATTERN.test(gstin.toUpperCase());
}

/**
 * Extract the 2-digit state code prefix from a GSTIN. Returns null if the
 * input is not a structurally valid GSTIN.
 */
export function gstinStateCode(gstin: string): string | null {
  if (!isValidGstinFormat(gstin)) return null;
  return gstin.slice(0, 2);
}
