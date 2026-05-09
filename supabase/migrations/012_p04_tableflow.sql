-- ============================================================================
-- Migration 012: p04_tableflow — TableFlow Smart Restaurant OS
-- ============================================================================
-- Phase 1 (this migration): core POS primitives — restaurants, tables, menu
-- categories, menu items, orders, order items. No WhatsApp, no inventory, no
-- staff management (Phase 2+).
--
-- All tables prefixed with p04_ to avoid collision with P01/P02/P03. RLS is
-- service-role only — dashboard routes authenticate via Clerk and scope all
-- queries by restaurant ownership chain using the service-role client.
--
-- Idempotent: IF NOT EXISTS / ON CONFLICT DO NOTHING / DROP IF EXISTS
-- everywhere, so the apply-migration script can re-run safely.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE p04_table_status  AS ENUM ('available', 'occupied', 'reserved', 'out_of_service');
  CREATE TYPE p04_order_status  AS ENUM ('open', 'sent_to_kitchen', 'ready', 'served', 'paid', 'cancelled');
  CREATE TYPE p04_order_kind    AS ENUM ('dine_in', 'takeaway', 'delivery');
  CREATE TYPE p04_item_status   AS ENUM ('pending', 'preparing', 'ready', 'served', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- p04_restaurants — one row per restaurant location (tenant root)
-- ---------------------------------------------------------------------------
-- owner_clerk_user_id ties the restaurant to a specific Clerk user. A user
-- may own multiple restaurants (e.g. chain of outlets). Ownership is the
-- primary auth boundary — every child table is scoped to restaurant_id and
-- we verify ownership upstream before any DB call.

CREATE TABLE IF NOT EXISTS public.p04_restaurants (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_clerk_user_id       TEXT          NOT NULL,
  name                      TEXT          NOT NULL,
  address                   TEXT,
  gstin                     TEXT,                                           -- nullable; many small restaurants are unregistered or composition
  state_code                TEXT          NOT NULL,                         -- 2-digit Indian state code
  state_name                TEXT          NOT NULL,
  phone                     TEXT,
  email                     TEXT,
  currency                  TEXT          NOT NULL DEFAULT 'INR',
  tax_inclusive_pricing     BOOLEAN       NOT NULL DEFAULT FALSE,           -- TRUE = prices on menu already include GST
  service_charge_percent    NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (service_charge_percent >= 0 AND service_charge_percent <= 50),
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p04_restaurants_owner
  ON public.p04_restaurants (owner_clerk_user_id);

ALTER TABLE public.p04_restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p04_restaurants: deny anon"          ON public.p04_restaurants;
DROP POLICY IF EXISTS "p04_restaurants: deny authenticated" ON public.p04_restaurants;
CREATE POLICY "p04_restaurants: deny anon"
  ON public.p04_restaurants FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p04_restaurants: deny authenticated"
  ON public.p04_restaurants FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p04_menu_categories — ordered groupings on the menu (Starters, Mains, etc.)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.p04_menu_categories (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID          NOT NULL REFERENCES public.p04_restaurants (id) ON DELETE CASCADE,
  name          TEXT          NOT NULL,
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p04_menu_categories_restaurant
  ON public.p04_menu_categories (restaurant_id, sort_order);

ALTER TABLE public.p04_menu_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p04_menu_categories: deny anon"          ON public.p04_menu_categories;
DROP POLICY IF EXISTS "p04_menu_categories: deny authenticated" ON public.p04_menu_categories;
CREATE POLICY "p04_menu_categories: deny anon"
  ON public.p04_menu_categories FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p04_menu_categories: deny authenticated"
  ON public.p04_menu_categories FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p04_menu_items — individual dishes / drinks
-- ---------------------------------------------------------------------------
-- price is the menu-facing price. Whether it's inclusive of GST depends on
-- the restaurant.tax_inclusive_pricing flag. The order engine reads that flag
-- and back-calculates taxable_amount when tax_inclusive_pricing = TRUE.
-- gst_rate_percent defaults to 5 (the standard restaurant GST slab for
-- non-AC and below ₹7,500 turnover per transaction); AC/fine-dining = 18%.
-- The category_id FK is NOT NULL — every item must belong to a category.

CREATE TABLE IF NOT EXISTS public.p04_menu_items (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID          NOT NULL REFERENCES public.p04_restaurants (id) ON DELETE CASCADE,
  category_id       UUID          NOT NULL REFERENCES public.p04_menu_categories (id) ON DELETE CASCADE,
  name              TEXT          NOT NULL,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  gst_rate_percent  NUMERIC(5,2)  NOT NULL DEFAULT 5 CHECK (gst_rate_percent >= 0),
  tags              TEXT[]        NOT NULL DEFAULT '{}',                    -- e.g. ['veg','jain','spicy','gluten_free']
  photo_url         TEXT,
  is_available      BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order        INTEGER       NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p04_menu_items_restaurant
  ON public.p04_menu_items (restaurant_id, is_available, sort_order);

CREATE INDEX IF NOT EXISTS idx_p04_menu_items_category
  ON public.p04_menu_items (category_id);

ALTER TABLE public.p04_menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p04_menu_items: deny anon"          ON public.p04_menu_items;
DROP POLICY IF EXISTS "p04_menu_items: deny authenticated" ON public.p04_menu_items;
CREATE POLICY "p04_menu_items: deny anon"
  ON public.p04_menu_items FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p04_menu_items: deny authenticated"
  ON public.p04_menu_items FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p04_orders — order header (one per table session / takeaway transaction)
-- ---------------------------------------------------------------------------
-- order_number is a human-readable identifier monotonic per restaurant,
-- e.g. "#0042" for the 42nd order at this restaurant. It is generated by the
-- createOrder() db helper using an advisory lock pattern.
-- table_id is nullable because takeaway/delivery orders have no table.
-- Financial fields (subtotal, gst_amount, etc.) are computed server-side by
-- the createOrder() helper and written here so billing can read totals without
-- re-scanning all order_items. They are updated whenever items are added/removed.

CREATE TABLE IF NOT EXISTS public.p04_orders (
  id                      UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id           UUID              NOT NULL REFERENCES public.p04_restaurants (id) ON DELETE CASCADE,
  table_id                UUID,                                             -- FK to p04_tables added below (after that table exists)
  order_number            TEXT              NOT NULL,
  status                  p04_order_status  NOT NULL DEFAULT 'open',
  order_kind              p04_order_kind    NOT NULL DEFAULT 'dine_in',
  customer_name           TEXT,
  customer_phone          TEXT,
  subtotal                NUMERIC(12,2)     NOT NULL DEFAULT 0,
  gst_amount              NUMERIC(12,2)     NOT NULL DEFAULT 0,
  service_charge_amount   NUMERIC(12,2)     NOT NULL DEFAULT 0,
  total_amount            NUMERIC(12,2)     NOT NULL DEFAULT 0,
  paid_amount             NUMERIC(12,2)     NOT NULL DEFAULT 0,
  notes                   TEXT,
  created_at              TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  closed_at               TIMESTAMPTZ,
  UNIQUE (restaurant_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_p04_orders_restaurant_status
  ON public.p04_orders (restaurant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_p04_orders_table
  ON public.p04_orders (table_id) WHERE table_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_p04_orders_restaurant_created
  ON public.p04_orders (restaurant_id, created_at DESC);

ALTER TABLE public.p04_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p04_orders: deny anon"          ON public.p04_orders;
DROP POLICY IF EXISTS "p04_orders: deny authenticated" ON public.p04_orders;
CREATE POLICY "p04_orders: deny anon"
  ON public.p04_orders FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p04_orders: deny authenticated"
  ON public.p04_orders FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p04_tables — restaurant floor plan / table registry
-- ---------------------------------------------------------------------------
-- current_order_id is a nullable soft reference to the active p04_orders row.
-- We intentionally skip the FOREIGN KEY constraint here to avoid the circular
-- dependency (orders.table_id → tables, tables.current_order_id → orders).
-- Application code maintains the invariant. When an order is paid/cancelled,
-- the update handler nulls current_order_id and sets status back to 'available'.

CREATE TABLE IF NOT EXISTS public.p04_tables (
  id                UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID              NOT NULL REFERENCES public.p04_restaurants (id) ON DELETE CASCADE,
  table_number      TEXT              NOT NULL,                             -- display label: "T-12" / "5" / "Rooftop-3"
  seats             SMALLINT          NOT NULL DEFAULT 4 CHECK (seats > 0),
  section           TEXT,                                                   -- 'indoor' / 'outdoor' / 'rooftop' / NULL
  status            p04_table_status  NOT NULL DEFAULT 'available',
  current_order_id  UUID,                                                   -- no FK — circular; app-maintained
  created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_p04_tables_restaurant
  ON public.p04_tables (restaurant_id, status);

ALTER TABLE public.p04_tables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p04_tables: deny anon"          ON public.p04_tables;
DROP POLICY IF EXISTS "p04_tables: deny authenticated" ON public.p04_tables;
CREATE POLICY "p04_tables: deny anon"
  ON public.p04_tables FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p04_tables: deny authenticated"
  ON public.p04_tables FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- Add the deferred FK from orders.table_id → tables now that both tables exist
DO $$ BEGIN
  ALTER TABLE public.p04_orders
    ADD CONSTRAINT fk_p04_orders_table
    FOREIGN KEY (table_id) REFERENCES public.p04_tables (id)
    ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- p04_order_items — individual line items within an order
-- ---------------------------------------------------------------------------
-- unit_price is a snapshot of the menu_item price at the time of ordering so
-- historical bills are unaffected by future price changes. modifiers captures
-- free-form item customisations (spice level, extras) without a rigid schema.

CREATE TABLE IF NOT EXISTS public.p04_order_items (
  id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID              NOT NULL REFERENCES public.p04_orders (id) ON DELETE CASCADE,
  menu_item_id  UUID              NOT NULL REFERENCES public.p04_menu_items (id) ON DELETE RESTRICT,
  line_number   INTEGER           NOT NULL,
  quantity      SMALLINT          NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price    NUMERIC(10,2)     NOT NULL CHECK (unit_price >= 0),         -- snapshot at order time
  modifiers     JSONB             NOT NULL DEFAULT '{}',                    -- {"spice_level":"medium","extras":["cheese"]}
  notes         TEXT,
  status        p04_item_status   NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, line_number)
);

CREATE INDEX IF NOT EXISTS idx_p04_order_items_order
  ON public.p04_order_items (order_id, line_number);

CREATE INDEX IF NOT EXISTS idx_p04_order_items_menu_item
  ON public.p04_order_items (menu_item_id);

ALTER TABLE public.p04_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p04_order_items: deny anon"          ON public.p04_order_items;
DROP POLICY IF EXISTS "p04_order_items: deny authenticated" ON public.p04_order_items;
CREATE POLICY "p04_order_items: deny anon"
  ON public.p04_order_items FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p04_order_items: deny authenticated"
  ON public.p04_order_items FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- updated_at auto-trigger (per-product function to avoid collisions)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.p04_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_p04_restaurants_updated_at    ON public.p04_restaurants;
DROP TRIGGER IF EXISTS trg_p04_menu_categories_updated_at ON public.p04_menu_categories;
DROP TRIGGER IF EXISTS trg_p04_menu_items_updated_at     ON public.p04_menu_items;
DROP TRIGGER IF EXISTS trg_p04_orders_updated_at         ON public.p04_orders;
DROP TRIGGER IF EXISTS trg_p04_tables_updated_at         ON public.p04_tables;

CREATE TRIGGER trg_p04_restaurants_updated_at
  BEFORE UPDATE ON public.p04_restaurants
  FOR EACH ROW EXECUTE FUNCTION public.p04_set_updated_at();

CREATE TRIGGER trg_p04_menu_categories_updated_at
  BEFORE UPDATE ON public.p04_menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.p04_set_updated_at();

CREATE TRIGGER trg_p04_menu_items_updated_at
  BEFORE UPDATE ON public.p04_menu_items
  FOR EACH ROW EXECUTE FUNCTION public.p04_set_updated_at();

CREATE TRIGGER trg_p04_orders_updated_at
  BEFORE UPDATE ON public.p04_orders
  FOR EACH ROW EXECUTE FUNCTION public.p04_set_updated_at();

CREATE TRIGGER trg_p04_tables_updated_at
  BEFORE UPDATE ON public.p04_tables
  FOR EACH ROW EXECUTE FUNCTION public.p04_set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper function: atomically reserve the next order number per restaurant.
-- ---------------------------------------------------------------------------
-- Uses advisory locks keyed on the restaurant's internal integer OID so two
-- concurrent orders for the same restaurant can't race to claim the same
-- order_number. The number is padded to 4 digits: "#0001", "#0042", "#1000".
-- We store the sequence in a side-table to avoid altering p04_restaurants
-- after the fact.
--
-- NOTE: For the MVP we implement this as a Postgres sequence-per-restaurant
-- approach via a sequences lookup table below. This avoids the ALTER TABLE
-- route.

CREATE TABLE IF NOT EXISTS public.p04_order_sequences (
  restaurant_id UUID    PRIMARY KEY REFERENCES public.p04_restaurants (id) ON DELETE CASCADE,
  next_number   INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.p04_order_sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "p04_order_sequences: deny anon"          ON public.p04_order_sequences;
DROP POLICY IF EXISTS "p04_order_sequences: deny authenticated" ON public.p04_order_sequences;
CREATE POLICY "p04_order_sequences: deny anon"
  ON public.p04_order_sequences FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "p04_order_sequences: deny authenticated"
  ON public.p04_order_sequences FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.p04_next_order_number(p_restaurant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
  v_next  INTEGER;
  v_label TEXT;
BEGIN
  -- Upsert to ensure a sequence row exists, then lock & increment atomically.
  INSERT INTO public.p04_order_sequences (restaurant_id, next_number)
  VALUES (p_restaurant_id, 1)
  ON CONFLICT (restaurant_id) DO NOTHING;

  UPDATE public.p04_order_sequences
  SET    next_number = next_number + 1
  WHERE  restaurant_id = p_restaurant_id
  RETURNING next_number - 1 INTO v_next;

  v_label := '#' || LPAD(v_next::TEXT, 4, '0');
  RETURN v_label;
END;
$$;
