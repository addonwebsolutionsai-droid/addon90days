/**
 * GST calculation engine — unit tests.
 *
 * Uses Node's built-in test runner (node:test, GA since Node 20). Run with:
 *
 *     node --test --import tsx ./src/lib/p03/gst-calc.test.ts
 *
 * Or add a "test:p03" script to package.json. Zero new dependencies — the
 * goal here is fast feedback on the GST math, which is pure functions and
 * doesn't need a full test framework.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  round2,
  roundToRupee,
  classifySupply,
  computeLine,
  computeInvoiceTotals,
  isValidGstinFormat,
  gstinStateCode,
  type PartyLocation,
} from "./gst-calc";

const GUJARAT:     PartyLocation = { stateCode: "24", countryCode: "IN" };
const GUJARAT_2:   PartyLocation = { stateCode: "24", countryCode: "IN" };
const MAHARASHTRA: PartyLocation = { stateCode: "27", countryCode: "IN" };
const USA:         PartyLocation = { stateCode: "",   countryCode: "US" };

describe("round2", () => {
  it("rounds 0.5 away from zero (Indian half-up)", () => {
    assert.equal(round2(0.005), 0.01);
    assert.equal(round2(0.015), 0.02);
    assert.equal(round2(-0.005), -0.01);
  });

  it("preserves already-2dp values", () => {
    assert.equal(round2(123.45), 123.45);
    assert.equal(round2(0), 0);
  });
});

describe("roundToRupee", () => {
  it("rounds half-up to the nearest rupee", () => {
    assert.equal(roundToRupee(99.49), 99);
    assert.equal(roundToRupee(99.50), 100);
    assert.equal(roundToRupee(-99.50), -100);
  });
});

describe("classifySupply", () => {
  it("intra-state when both parties in the same state", () => {
    assert.equal(classifySupply(GUJARAT, GUJARAT_2), "intra_state");
  });
  it("inter-state when different states", () => {
    assert.equal(classifySupply(GUJARAT, MAHARASHTRA), "inter_state");
  });
  it("export when buyer outside India", () => {
    assert.equal(classifySupply(GUJARAT, USA), "export");
  });
  it("export when seller outside India (import-of-services)", () => {
    assert.equal(classifySupply(USA, GUJARAT), "export");
  });
});

describe("computeLine — intra-state regular scheme", () => {
  it("splits 18% rate into 9% CGST + 9% SGST", () => {
    const line = computeLine({
      quantity: 1, unitPrice: 1000, discountPercent: 0, gstRatePercent: 18,
    }, "intra_state", "regular");

    assert.equal(line.taxableAmount, 1000);
    assert.equal(line.cgstAmount,    90);
    assert.equal(line.sgstAmount,    90);
    assert.equal(line.igstAmount,    0);
    assert.equal(line.lineTotal,     1180);
  });

  it("applies discount before tax", () => {
    const line = computeLine({
      quantity: 2, unitPrice: 500, discountPercent: 10, gstRatePercent: 18,
    }, "intra_state", "regular");

    assert.equal(line.taxableAmount, 900);
    assert.equal(line.cgstAmount,    81);
    assert.equal(line.sgstAmount,    81);
    assert.equal(line.lineTotal,     1062);
  });

  it("handles 5% rate (CGST 2.5 + SGST 2.5)", () => {
    const line = computeLine({
      quantity: 1, unitPrice: 200, discountPercent: 0, gstRatePercent: 5,
    }, "intra_state", "regular");

    assert.equal(line.cgstAmount, 5);
    assert.equal(line.sgstAmount, 5);
    assert.equal(line.lineTotal,  210);
  });

  it("handles 0% (nil-rated goods like books)", () => {
    const line = computeLine({
      quantity: 5, unitPrice: 100, discountPercent: 0, gstRatePercent: 0,
    }, "intra_state", "regular");

    assert.equal(line.cgstAmount, 0);
    assert.equal(line.sgstAmount, 0);
    assert.equal(line.lineTotal,  500);
  });
});

describe("computeLine — inter-state regular scheme", () => {
  it("uses single IGST at full rate", () => {
    const line = computeLine({
      quantity: 1, unitPrice: 1000, discountPercent: 0, gstRatePercent: 18,
    }, "inter_state", "regular");

    assert.equal(line.cgstAmount, 0);
    assert.equal(line.sgstAmount, 0);
    assert.equal(line.igstAmount, 180);
    assert.equal(line.lineTotal,  1180);
  });
});

describe("computeLine — export", () => {
  it("zero-rates the line (no GST charged)", () => {
    const line = computeLine({
      quantity: 1, unitPrice: 1000, discountPercent: 0, gstRatePercent: 18,
    }, "export", "regular");

    assert.equal(line.cgstAmount, 0);
    assert.equal(line.sgstAmount, 0);
    assert.equal(line.igstAmount, 0);
    assert.equal(line.lineTotal,  1000);
  });
});

describe("computeLine — composition scheme", () => {
  it("zeros all tax fields on the invoice line", () => {
    const line = computeLine({
      quantity: 1, unitPrice: 1000, discountPercent: 0, gstRatePercent: 18,
    }, "intra_state", "composition");

    assert.equal(line.cgstAmount, 0);
    assert.equal(line.sgstAmount, 0);
    assert.equal(line.igstAmount, 0);
    assert.equal(line.lineTotal,  1000);
  });
});

describe("computeLine — cess on demerit goods", () => {
  it("adds cess on top of GST for inter-state", () => {
    const line = computeLine({
      quantity: 1, unitPrice: 1000, discountPercent: 0, gstRatePercent: 28, cessRatePercent: 12,
    }, "inter_state", "regular");

    assert.equal(line.igstAmount, 280);
    assert.equal(line.cessAmount, 120);
    assert.equal(line.lineTotal,  1400);
  });
});

describe("computeLine — input validation", () => {
  it("rejects zero or negative quantity", () => {
    assert.throws(() => computeLine({
      quantity: 0, unitPrice: 100, discountPercent: 0, gstRatePercent: 18,
    }, "intra_state"));
  });
  it("rejects negative unitPrice", () => {
    assert.throws(() => computeLine({
      quantity: 1, unitPrice: -1, discountPercent: 0, gstRatePercent: 18,
    }, "intra_state"));
  });
  it("rejects discount > 100", () => {
    assert.throws(() => computeLine({
      quantity: 1, unitPrice: 100, discountPercent: 110, gstRatePercent: 18,
    }, "intra_state"));
  });
});

describe("computeInvoiceTotals", () => {
  it("aggregates multi-line invoice with round-off", () => {
    const l1 = computeLine({ quantity: 3, unitPrice: 333.33, discountPercent: 0, gstRatePercent: 18 }, "intra_state", "regular");
    const l2 = computeLine({ quantity: 1, unitPrice: 250.50, discountPercent: 0, gstRatePercent: 18 }, "intra_state", "regular");

    const totals = computeInvoiceTotals({ lines: [l1, l2], roundOffToNearestRupee: true });

    // l1: gross 999.99, cgst 89.999→90, sgst 90, line 1179.99
    // l2: gross 250.50, cgst 22.545→22.55, sgst 22.55, line 295.60
    // subtotal 1250.49, cgst 112.55, sgst 112.55, total 1475.59 → round to 1476
    assert.equal(totals.subtotalAmount, 1250.49);
    assert.ok(Math.abs(totals.cgstAmount - 112.55) < 0.01);
    assert.ok(Math.abs(totals.sgstAmount - 112.55) < 0.01);
    assert.equal(totals.igstAmount, 0);
    assert.equal(totals.totalAmount, 1476);
    assert.ok(Math.abs(totals.roundOffAmount - 0.41) < 0.01);
  });

  it("respects roundOffToNearestRupee=false", () => {
    const l1 = computeLine({ quantity: 1, unitPrice: 99.99, discountPercent: 0, gstRatePercent: 18 }, "intra_state", "regular");
    const totals = computeInvoiceTotals({ lines: [l1], roundOffToNearestRupee: false });
    assert.equal(totals.totalAmount, 117.99);
    assert.equal(totals.roundOffAmount, 0);
  });
});

describe("isValidGstinFormat", () => {
  it("accepts valid 15-char GSTINs", () => {
    assert.equal(isValidGstinFormat("24AAACR5055K1Z5"), true);
    assert.equal(isValidGstinFormat("27AAAPL1234C1ZP"), true);
  });
  it("rejects wrong length", () => {
    assert.equal(isValidGstinFormat("24AAACR5055K1Z"),   false);
    assert.equal(isValidGstinFormat("24AAACR5055K1Z55"), false);
  });
  it("normalizes lowercase", () => {
    assert.equal(isValidGstinFormat("24aaacr5055k1z5"), true);
  });
  it("rejects malformed prefixes", () => {
    assert.equal(isValidGstinFormat("AABBCR5055K1Z5"), false);
  });
});

describe("gstinStateCode", () => {
  it("extracts state code from a valid GSTIN", () => {
    assert.equal(gstinStateCode("24AAACR5055K1Z5"), "24");
    assert.equal(gstinStateCode("27AAAPL1234C1ZP"), "27");
  });
  it("returns null for invalid GSTIN", () => {
    assert.equal(gstinStateCode("INVALID"), null);
  });
});
