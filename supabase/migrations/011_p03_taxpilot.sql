-- ============================================================================
-- Migration 011: p03_taxpilot — TaxPilot (AI GST & Invoicing for Indian SMBs)
-- ============================================================================
-- Phase 1 (this migration): invoicing primitives — businesses, customers,
-- invoices, line items, HSN master. Pure local generation. No GSTN portal
-- filing, no IRP e-Invoice IRN. Those land in Phase 2 once GSP registration
-- and IRP sandbox credentials are approved (2-4 week external wait).
--
-- All tables prefixed with p03_ to avoid collision with P01/P02. RLS is
-- service-role only — dashboard routes authenticate via Clerk and scope all
-- queries by business_id using the service-role client.
--
-- Idempotent: IF NOT EXISTS / ON CONFLICT DO NOTHING / DROP IF EXISTS
-- everywhere, so the apply-migration script can re-run this safely.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE p03_gst_scheme    AS ENUM ('regular', 'composition', 'unregistered');
  CREATE TYPE p03_invoice_kind  AS ENUM ('tax_invoice', 'bill_of_supply', 'export_invoice', 'credit_note', 'debit_note');
  CREATE TYPE p03_invoice_status AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'cancelled');
  CREATE TYPE p03_supply_type   AS ENUM ('intra_state', 'inter_state', 'export');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- p03_businesses — owner-facing business profile (one or more per Clerk user)
-- ---------------------------------------------------------------------------
-- A founder can register multiple businesses under one TaxPilot login (e.g.
-- a CA managing 30 client GSTINs). Each business has its own GSTIN, invoice
-- numbering sequence, and brand settings.

CREATE TABLE IF NOT EXISTS public.p03_businesses (
  id                       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_clerk_user_id      TEXT            NOT NULL,
  legal_name               TEXT            NOT NULL,
  trade_name               TEXT,                                     -- "doing business as"
  gstin                    TEXT,                                     -- 15-char GSTIN (nullable for unregistered businesses)
  pan                      TEXT,                                     -- 10-char PAN
  state_code               TEXT            NOT NULL,                 -- 2-digit Indian state code (e.g. "24" for Gujarat) — used for intra/inter-state determination
  state_name               TEXT            NOT NULL,
  address_line1            TEXT,
  address_line2            TEXT,
  city                     TEXT,
  pincode                  TEXT,
  email                    TEXT,
  phone                    TEXT,
  gst_scheme               p03_gst_scheme  NOT NULL DEFAULT 'regular',
  composition_rate_percent NUMERIC(5,2),                             -- 1 / 2 / 5 / 6 etc., only when scheme = 'composition'
  invoice_prefix           TEXT            NOT NULL DEFAULT 'INV-',  -- e.g. "INV-2026-" for FY-based numbering
  next_invoice_number      INTEGER         NOT NULL DEFAULT 1,       -- monotonic per-business counter
  logo_url                 TEXT,
  bank_account_number_enc  BYTEA,                                    -- AES-256-GCM via P02_ENCRYPTION_KEY (reused — single key per project)
  bank_ifsc                TEXT,
  default_terms            TEXT,                                     -- "Payment due in 30 days" boilerplate
  created_at               TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  UNIQUE (owner_clerk_user_id, gstin)                                -- a user can't register the same GSTIN twice
);

CREATE INDEX IF NOT EXISTS idx_p03_businesses_owner
  ON public.p03_businesses (owner_clerk_user_id);

ALTER TABLE public.p03_businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p03_businesses: deny anon"          ON public.p03_businesses;
DROP POLICY IF EXISTS "p03_businesses: deny authenticated" ON public.p03_businesses;
CREATE POLICY "p03_businesses: deny anon"
  ON public.p03_businesses FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p03_businesses: deny authenticated"
  ON public.p03_businesses FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p03_customers — the buyer side of an invoice
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.p03_customers (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID            NOT NULL REFERENCES public.p03_businesses (id) ON DELETE CASCADE,
  name            TEXT            NOT NULL,
  email           TEXT,
  phone           TEXT,
  gstin           TEXT,                                              -- buyer's GSTIN (B2B); null = unregistered (B2C)
  place_of_supply_state_code TEXT NOT NULL,                          -- 2-digit code; drives intra/inter-state tax split
  place_of_supply_state_name TEXT NOT NULL,
  address_line1   TEXT,
  address_line2   TEXT,
  city            TEXT,
  pincode         TEXT,
  country_code    TEXT            NOT NULL DEFAULT 'IN',             -- ISO-2; non-IN = export
  notes           TEXT,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p03_customers_business
  ON public.p03_customers (business_id);

CREATE INDEX IF NOT EXISTS idx_p03_customers_business_name
  ON public.p03_customers (business_id, lower(name));

ALTER TABLE public.p03_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p03_customers: deny anon"          ON public.p03_customers;
DROP POLICY IF EXISTS "p03_customers: deny authenticated" ON public.p03_customers;
CREATE POLICY "p03_customers: deny anon"
  ON public.p03_customers FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p03_customers: deny authenticated"
  ON public.p03_customers FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p03_hsn_codes — HSN/SAC master, seeded with a starter set
-- ---------------------------------------------------------------------------
-- HSN = Harmonized System of Nomenclature (goods); SAC = Services Accounting
-- Code. Required on every GST invoice line. Bundled locally so the invoice
-- creator can autocomplete without an external lookup. Quarterly refresh
-- from the official CBIC list happens via a separate migration / script.

CREATE TABLE IF NOT EXISTS public.p03_hsn_codes (
  code         TEXT         PRIMARY KEY,                             -- e.g. "8517" or "998314"
  kind         TEXT         NOT NULL,                                -- 'hsn' (goods) or 'sac' (services)
  description  TEXT         NOT NULL,
  gst_rate_percent NUMERIC(5,2) NOT NULL,                            -- 0 / 5 / 12 / 18 / 28 etc.
  category     TEXT,                                                 -- coarse grouping for UI filters
  is_common    BOOLEAN      NOT NULL DEFAULT FALSE                   -- top-of-suggest list for autocomplete
);

-- pg_trgm extension for fuzzy autocomplete; must exist BEFORE any index that
-- uses gin_trgm_ops. Safe to enable repeatedly.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_p03_hsn_codes_common
  ON public.p03_hsn_codes (is_common) WHERE is_common = TRUE;

CREATE INDEX IF NOT EXISTS idx_p03_hsn_codes_description_trgm
  ON public.p03_hsn_codes USING gin (description gin_trgm_ops);

ALTER TABLE public.p03_hsn_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p03_hsn_codes: read public"        ON public.p03_hsn_codes;
DROP POLICY IF EXISTS "p03_hsn_codes: deny anon write"    ON public.p03_hsn_codes;
DROP POLICY IF EXISTS "p03_hsn_codes: deny authenticated" ON public.p03_hsn_codes;
-- HSN master is public read-only (it's not customer data; suppressing it from
-- end users would just mean bundling the same list in JS). RLS still blocks
-- writes from the public client.
CREATE POLICY "p03_hsn_codes: read public"
  ON public.p03_hsn_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "p03_hsn_codes: deny anon write"
  ON public.p03_hsn_codes FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "p03_hsn_codes: deny authenticated"
  ON public.p03_hsn_codes FOR INSERT TO authenticated WITH CHECK (false);

-- Seed: 24 common HSN/SAC codes covering the bulk of Indian SMB use cases.
-- The full official HSN master is 5,000+ entries; we bundle these as the
-- "is_common" set so autocomplete has good defaults out of the box. The
-- full master is loaded by a follow-on data script.
INSERT INTO public.p03_hsn_codes (code, kind, description, gst_rate_percent, category, is_common) VALUES
  -- Services (SAC) — the bulk of TaxPilot's freelancer ICP
  ('998313', 'sac', 'Information technology (IT) consulting services',                  18, 'services',     TRUE),
  ('998314', 'sac', 'Information technology design and development services',           18, 'services',     TRUE),
  ('998391', 'sac', 'Specialty design services (web, graphic)',                          18, 'services',     TRUE),
  ('998361', 'sac', 'Advertising services',                                              18, 'services',     TRUE),
  ('998399', 'sac', 'Other professional, technical and business services n.e.c.',        18, 'services',     TRUE),
  ('998511', 'sac', 'Recruitment services',                                              18, 'services',     TRUE),
  ('998596', 'sac', 'Event management services',                                         18, 'services',     TRUE),
  ('998433', 'sac', 'Hosting and information technology infrastructure services',        18, 'services',     TRUE),
  ('998732', 'sac', 'Architectural and engineering services',                            18, 'services',     FALSE),
  ('996511', 'sac', 'Road transport of goods',                                             5, 'transport',    FALSE),
  -- Goods (HSN) — common SMB inventory
  ('8517',   'hsn', 'Telephones, smartphones and other communication devices',          18, 'electronics',  TRUE),
  ('8471',   'hsn', 'Computers, laptops and parts',                                     18, 'electronics',  TRUE),
  ('6109',   'hsn', 'T-shirts, singlets and other vests, knitted or crocheted',          5, 'apparel',      TRUE),
  ('6203',   'hsn', 'Men''s suits, jackets, trousers',                                  12, 'apparel',      FALSE),
  ('9403',   'hsn', 'Furniture (other than seats)',                                     18, 'furniture',    TRUE),
  ('4901',   'hsn', 'Printed books, brochures, leaflets',                                0, 'publishing',   FALSE),
  ('1006',   'hsn', 'Rice',                                                              5, 'food',         FALSE),
  ('2106',   'hsn', 'Food preparations not elsewhere specified',                        18, 'food',         FALSE),
  ('3304',   'hsn', 'Beauty or make-up preparations',                                   18, 'cosmetics',    FALSE),
  ('6911',   'hsn', 'Tableware, kitchenware of porcelain or china',                     12, 'pottery',      FALSE),
  ('8418',   'hsn', 'Refrigerators, freezers',                                          28, 'appliances',   FALSE),
  ('3923',   'hsn', 'Articles for conveyance / packing of goods (plastic)',             18, 'packaging',    FALSE),
  -- Common composition / nil-rated
  ('00',     'hsn', 'Exempt / nil-rated supplies (use SAC where applicable)',            0, 'misc',         FALSE),
  ('9999',   'hsn', 'Other (use only when no specific HSN/SAC matches)',                18, 'misc',         FALSE)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- p03_invoices — invoice header
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.p03_invoices (
  id                  UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID                  NOT NULL REFERENCES public.p03_businesses (id) ON DELETE CASCADE,
  customer_id         UUID                  NOT NULL REFERENCES public.p03_customers   (id) ON DELETE RESTRICT,
  invoice_number      TEXT                  NOT NULL,                  -- the human-visible string, e.g. "INV-2026-0042"
  invoice_kind        p03_invoice_kind      NOT NULL DEFAULT 'tax_invoice',
  status              p03_invoice_status    NOT NULL DEFAULT 'draft',
  supply_type         p03_supply_type       NOT NULL,                  -- intra / inter / export — drives CGST+SGST vs IGST split
  invoice_date        DATE                  NOT NULL,
  due_date            DATE,
  reverse_charge      BOOLEAN               NOT NULL DEFAULT FALSE,
  notes               TEXT,
  terms               TEXT,
  -- pre-tax totals
  subtotal_amount     NUMERIC(14,2)         NOT NULL DEFAULT 0,        -- sum of line taxable_amount
  discount_amount     NUMERIC(14,2)         NOT NULL DEFAULT 0,
  -- tax breakdown (denormalised from lines for fast list queries)
  cgst_amount         NUMERIC(14,2)         NOT NULL DEFAULT 0,
  sgst_amount         NUMERIC(14,2)         NOT NULL DEFAULT 0,
  igst_amount         NUMERIC(14,2)         NOT NULL DEFAULT 0,
  cess_amount         NUMERIC(14,2)         NOT NULL DEFAULT 0,
  round_off_amount    NUMERIC(14,2)         NOT NULL DEFAULT 0,
  total_amount        NUMERIC(14,2)         NOT NULL DEFAULT 0,        -- subtotal - discount + cgst + sgst + igst + cess + round_off
  paid_amount         NUMERIC(14,2)         NOT NULL DEFAULT 0,
  -- e-invoicing — populated in Phase 2 when IRP integration lands
  irn                 TEXT,                                            -- 64-char IRN once IRP signs
  irn_signed_qr       TEXT,                                            -- base64 QR payload from IRP
  irn_ack_no          TEXT,
  irn_ack_date        TIMESTAMPTZ,
  pdf_storage_path    TEXT,                                            -- supabase storage path for the rendered PDF/A
  created_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, invoice_number)                                 -- per-business uniqueness; same number can repeat across businesses
);

CREATE INDEX IF NOT EXISTS idx_p03_invoices_business_status_date
  ON public.p03_invoices (business_id, status, invoice_date DESC);

CREATE INDEX IF NOT EXISTS idx_p03_invoices_customer
  ON public.p03_invoices (customer_id);

CREATE INDEX IF NOT EXISTS idx_p03_invoices_business_date
  ON public.p03_invoices (business_id, invoice_date DESC);

ALTER TABLE public.p03_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p03_invoices: deny anon"          ON public.p03_invoices;
DROP POLICY IF EXISTS "p03_invoices: deny authenticated" ON public.p03_invoices;
CREATE POLICY "p03_invoices: deny anon"
  ON public.p03_invoices FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p03_invoices: deny authenticated"
  ON public.p03_invoices FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p03_invoice_lines — line items
-- ---------------------------------------------------------------------------
-- Each line carries its own HSN/SAC and GST rate snapshot at the time of
-- creation. We do NOT join back to p03_hsn_codes for the rate at print
-- time — if the master rate changes, historical invoices must remain
-- unchanged.

CREATE TABLE IF NOT EXISTS public.p03_invoice_lines (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        UUID            NOT NULL REFERENCES public.p03_invoices (id) ON DELETE CASCADE,
  line_number       INTEGER         NOT NULL,                          -- 1-based ordering within the invoice
  item_description  TEXT            NOT NULL,
  hsn_code          TEXT            NOT NULL,                          -- snapshot from p03_hsn_codes at creation; NOT a foreign key (see comment above)
  unit              TEXT            NOT NULL DEFAULT 'NOS',            -- UQC code: NOS / KGS / MTR / HRS etc.
  quantity          NUMERIC(14,3)   NOT NULL CHECK (quantity > 0),
  unit_price        NUMERIC(14,2)   NOT NULL CHECK (unit_price >= 0),
  discount_percent  NUMERIC(5,2)    NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  taxable_amount    NUMERIC(14,2)   NOT NULL,                          -- (quantity * unit_price) * (1 - discount_percent / 100)
  gst_rate_percent  NUMERIC(5,2)    NOT NULL CHECK (gst_rate_percent >= 0),
  cgst_amount       NUMERIC(14,2)   NOT NULL DEFAULT 0,
  sgst_amount       NUMERIC(14,2)   NOT NULL DEFAULT 0,
  igst_amount       NUMERIC(14,2)   NOT NULL DEFAULT 0,
  cess_rate_percent NUMERIC(5,2)    NOT NULL DEFAULT 0,
  cess_amount       NUMERIC(14,2)   NOT NULL DEFAULT 0,
  line_total        NUMERIC(14,2)   NOT NULL,                          -- taxable + cgst + sgst + igst + cess
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  UNIQUE (invoice_id, line_number)
);

CREATE INDEX IF NOT EXISTS idx_p03_invoice_lines_invoice
  ON public.p03_invoice_lines (invoice_id, line_number);

ALTER TABLE public.p03_invoice_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p03_invoice_lines: deny anon"          ON public.p03_invoice_lines;
DROP POLICY IF EXISTS "p03_invoice_lines: deny authenticated" ON public.p03_invoice_lines;
CREATE POLICY "p03_invoice_lines: deny anon"
  ON public.p03_invoice_lines FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p03_invoice_lines: deny authenticated"
  ON public.p03_invoice_lines FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- updated_at auto-update trigger (reused pattern; per-product function)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.p03_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_p03_businesses_updated_at ON public.p03_businesses;
CREATE TRIGGER trg_p03_businesses_updated_at
  BEFORE UPDATE ON public.p03_businesses
  FOR EACH ROW EXECUTE FUNCTION public.p03_set_updated_at();

DROP TRIGGER IF EXISTS trg_p03_customers_updated_at ON public.p03_customers;
CREATE TRIGGER trg_p03_customers_updated_at
  BEFORE UPDATE ON public.p03_customers
  FOR EACH ROW EXECUTE FUNCTION public.p03_set_updated_at();

DROP TRIGGER IF EXISTS trg_p03_invoices_updated_at ON public.p03_invoices;
CREATE TRIGGER trg_p03_invoices_updated_at
  BEFORE UPDATE ON public.p03_invoices
  FOR EACH ROW EXECUTE FUNCTION public.p03_set_updated_at();
