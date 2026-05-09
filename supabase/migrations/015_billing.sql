-- ============================================================================
-- Migration 015: billing — Plans, Subscriptions, Invoices, Refund Requests
-- ============================================================================
-- Idempotent: IF NOT EXISTS / ON CONFLICT DO NOTHING everywhere.
-- RLS: deny all (service-role client used exclusively by admin routes).
-- All prices stored in INR. Razorpay amounts use paise (multiply × 100 at
-- call site — never stored as paise here).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE billing_subscription_status AS ENUM (
    'active', 'past_due', 'cancelled', 'paused', 'trialing'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE billing_invoice_status AS ENUM (
    'draft', 'sent', 'paid', 'partially_refunded', 'refunded', 'failed', 'void'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE billing_refund_status AS ENUM (
    'pending', 'approved', 'rejected', 'processed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- billing_plans
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS billing_plans (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id                 TEXT NOT NULL,               -- 'p01','p02','p03','p04'
  name                       TEXT NOT NULL,
  slug                       TEXT NOT NULL,               -- unique per product
  price_monthly_inr          NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly_inr           NUMERIC(10,2),               -- NULL = no yearly option
  features                   JSONB NOT NULL DEFAULT '[]'::jsonb,
  entitlements               JSONB NOT NULL DEFAULT '{}'::jsonb,
  razorpay_plan_id_monthly   TEXT,                        -- populated via sync-razorpay
  razorpay_plan_id_yearly    TEXT,
  is_active                  BOOLEAN NOT NULL DEFAULT true,
  sort_order                 INT NOT NULL DEFAULT 0,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, slug)
);

ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "deny_all_billing_plans" ON billing_plans AS RESTRICTIVE
    FOR ALL USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- billing_subscriptions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id             TEXT NOT NULL,
  product_id                TEXT NOT NULL,
  plan_id                   UUID NOT NULL REFERENCES billing_plans(id),
  status                    billing_subscription_status NOT NULL DEFAULT 'active',
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  razorpay_subscription_id  TEXT,
  razorpay_customer_id      TEXT,
  cancelled_at              TIMESTAMPTZ,
  cancel_reason             TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_subs_user_product
  ON billing_subscriptions (clerk_user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_billing_subs_status
  ON billing_subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_billing_subs_period_end
  ON billing_subscriptions (current_period_end);

ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "deny_all_billing_subs" ON billing_subscriptions AS RESTRICTIVE
    FOR ALL USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- billing_invoices
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS billing_invoices (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id        UUID NOT NULL REFERENCES billing_subscriptions(id),
  clerk_user_id          TEXT NOT NULL,
  product_id             TEXT NOT NULL,
  razorpay_invoice_id    TEXT,
  razorpay_payment_id    TEXT,
  amount_inr             NUMERIC(12,2) NOT NULL,
  tax_amount_inr         NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_inr              NUMERIC(12,2) NOT NULL,
  status                 billing_invoice_status NOT NULL DEFAULT 'draft',
  issued_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at                TIMESTAMPTZ,
  due_at                 TIMESTAMPTZ,
  pdf_url                TEXT,
  line_items             JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_sub ON billing_invoices (subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_user ON billing_invoices (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON billing_invoices (status);

ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "deny_all_billing_invoices" ON billing_invoices AS RESTRICTIVE
    FOR ALL USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- billing_refund_requests
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS billing_refund_requests (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id                  UUID NOT NULL REFERENCES billing_invoices(id),
  subscription_id             UUID NOT NULL REFERENCES billing_subscriptions(id),
  clerk_user_id               TEXT NOT NULL,
  amount_inr                  NUMERIC(12,2) NOT NULL,
  reason                      TEXT NOT NULL,
  requested_by_clerk_user_id  TEXT NOT NULL,              -- the admin who initiated
  status                      billing_refund_status NOT NULL DEFAULT 'pending',
  razorpay_refund_id          TEXT,
  processed_at                TIMESTAMPTZ,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_refunds_invoice ON billing_refund_requests (invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_refunds_status  ON billing_refund_requests (status);

ALTER TABLE billing_refund_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "deny_all_billing_refunds" ON billing_refund_requests AS RESTRICTIVE
    FOR ALL USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Seed 12 plans (3 per product × P01/P02/P03/P04)
-- All prices 0 during beta. Pricing structure ready for post-beta flip.
-- razorpay_plan_id_* left NULL — admin syncs to Razorpay via /sync-razorpay.
-- ---------------------------------------------------------------------------

INSERT INTO billing_plans
  (product_id, name, slug, price_monthly_inr, price_yearly_inr, features, entitlements, is_active, sort_order)
VALUES
  -- P01 SKILON
  ('p01', 'Free',    'free',    0, 0,
   '["Unlimited skill runs","Community support","Claude Haiku"]'::jsonb,
   '{"max_installs":10,"skill_tier":"basic"}'::jsonb,
   true, 1),
  ('p01', 'Starter', 'starter', 0, 0,
   '["Everything in Free","50 Claude Sonnet runs/day","Priority support"]'::jsonb,
   '{"max_installs":100,"skill_tier":"sonnet","daily_runs":50}'::jsonb,
   true, 2),
  ('p01', 'Pro',     'pro',     0, 0,
   '["Everything in Starter","Unlimited Claude Opus runs","Custom MCP endpoints","SLA"]'::jsonb,
   '{"max_installs":-1,"skill_tier":"opus","daily_runs":-1}'::jsonb,
   true, 3),

  -- P02 ChatBase
  ('p02', 'Free',    'free',    0, 0,
   '["1 WhatsApp workspace","500 messages/month","Basic auto-reply"]'::jsonb,
   '{"max_workspaces":1,"monthly_messages":500}'::jsonb,
   true, 1),
  ('p02', 'Starter', 'starter', 0, 0,
   '["3 WhatsApp workspaces","10,000 messages/month","AI intent classification","Shared inbox"]'::jsonb,
   '{"max_workspaces":3,"monthly_messages":10000}'::jsonb,
   true, 2),
  ('p02', 'Pro',     'pro',     0, 0,
   '["Unlimited workspaces","Unlimited messages","Broadcast campaigns","Analytics dashboard","Dedicated support"]'::jsonb,
   '{"max_workspaces":-1,"monthly_messages":-1,"broadcasts":true}'::jsonb,
   true, 3),

  -- P03 TaxPilot
  ('p03', 'Free',    'free',    0, 0,
   '["1 GSTIN","25 invoices/month","e-Invoice generation","GST return preview"]'::jsonb,
   '{"max_businesses":1,"monthly_invoices":25}'::jsonb,
   true, 1),
  ('p03', 'Starter', 'starter', 0, 0,
   '["3 GSTINs","500 invoices/month","GSTR-1 filing","IRN + QR code"]'::jsonb,
   '{"max_businesses":3,"monthly_invoices":500}'::jsonb,
   true, 2),
  ('p03', 'Pro',     'pro',     0, 0,
   '["Unlimited GSTINs","Unlimited invoices","All GSTR filings","Audit trail export","Priority support"]'::jsonb,
   '{"max_businesses":-1,"monthly_invoices":-1,"gstr_filings":true}'::jsonb,
   true, 3),

  -- P04 TableFlow
  ('p04', 'Free',    'free',    0, 0,
   '["1 restaurant location","10 tables","Basic POS","Menu management"]'::jsonb,
   '{"max_locations":1,"max_tables":10}'::jsonb,
   true, 1),
  ('p04', 'Starter', 'starter', 0, 0,
   '["3 restaurant locations","Unlimited tables","KDS integration","Online ordering"]'::jsonb,
   '{"max_locations":3,"max_tables":-1}'::jsonb,
   true, 2),
  ('p04', 'Pro',     'pro',     0, 0,
   '["Unlimited locations","Inventory management","Staff shift management","Advanced reports","API access"]'::jsonb,
   '{"max_locations":-1,"max_tables":-1,"inventory":true,"staff":true}'::jsonb,
   true, 3)

ON CONFLICT (product_id, slug) DO NOTHING;
