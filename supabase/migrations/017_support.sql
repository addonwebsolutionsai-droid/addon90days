-- =============================================================================
-- 017_support.sql  ·  Per-product AI support tables
-- 18 tables total: {p01..p06}_support_{kb,conversations,messages}
--
-- Design decisions:
--   - Separate prefixed tables per product so each product is extractable.
--   - RLS deny-all for anon + authenticated; service-role only (all writes go
--     through Next.js API routes using supabaseAdmin).
--   - Shared intent classification reuses p02_intents (workspace_id IS NULL
--     rows = global defaults). Rationale: support intents are universal across
--     products ("pricing-question", "how-do-i", "complaint", "unknown"). If
--     product-specific intents are needed later, add a product_id column to
--     p02_intents (or rename to support_intents) without schema breakage.
--   - No seed data — admin fills KB per product.
--   - updated_at trigger via shared support_set_updated_at() function.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Shared trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.support_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- P01 — Claude Toolkit
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.p01_support_kb (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          TEXT        NOT NULL CHECK (kind IN ('text','url','faq')),
  source_url    TEXT,
  question      TEXT,
  raw_content   TEXT        NOT NULL DEFAULT '',
  parsed_chunks JSONB       NOT NULL DEFAULT '[]',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p01_support_kb_updated_at ON public.p01_support_kb;
CREATE TRIGGER p01_support_kb_updated_at
  BEFORE UPDATE ON public.p01_support_kb
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

ALTER TABLE public.p01_support_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p01_kb_deny_all" ON public.p01_support_kb AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p01_support_conversations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id       TEXT        NOT NULL,
  is_authenticated BOOLEAN     NOT NULL DEFAULT FALSE,
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','escalated','closed')),
  last_intent      TEXT,
  last_message_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p01_support_conversations_updated_at ON public.p01_support_conversations;
CREATE TRIGGER p01_support_conversations_updated_at
  BEFORE UPDATE ON public.p01_support_conversations
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

CREATE INDEX IF NOT EXISTS p01_support_conversations_visitor_idx
  ON public.p01_support_conversations (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS p01_support_conversations_status_idx
  ON public.p01_support_conversations (status, last_message_at DESC);

ALTER TABLE public.p01_support_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p01_conv_deny_all" ON public.p01_support_conversations AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p01_support_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.p01_support_conversations(id) ON DELETE CASCADE,
  direction       TEXT        NOT NULL CHECK (direction IN ('inbound','outbound')),
  role            TEXT        NOT NULL CHECK (role IN ('visitor','ai','human')),
  body            TEXT        NOT NULL,
  intent          TEXT,
  confidence      NUMERIC(3,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS p01_support_messages_conv_idx
  ON public.p01_support_messages (conversation_id, created_at);

ALTER TABLE public.p01_support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p01_msg_deny_all" ON public.p01_support_messages AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- =============================================================================
-- P02 — ChatBase
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.p02_support_kb (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          TEXT        NOT NULL CHECK (kind IN ('text','url','faq')),
  source_url    TEXT,
  question      TEXT,
  raw_content   TEXT        NOT NULL DEFAULT '',
  parsed_chunks JSONB       NOT NULL DEFAULT '[]',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p02_support_kb_updated_at ON public.p02_support_kb;
CREATE TRIGGER p02_support_kb_updated_at
  BEFORE UPDATE ON public.p02_support_kb
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

ALTER TABLE public.p02_support_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p02_kb_deny_all" ON public.p02_support_kb AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p02_support_conversations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id       TEXT        NOT NULL,
  is_authenticated BOOLEAN     NOT NULL DEFAULT FALSE,
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','escalated','closed')),
  last_intent      TEXT,
  last_message_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p02_support_conversations_updated_at ON public.p02_support_conversations;
CREATE TRIGGER p02_support_conversations_updated_at
  BEFORE UPDATE ON public.p02_support_conversations
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

CREATE INDEX IF NOT EXISTS p02_support_conversations_visitor_idx
  ON public.p02_support_conversations (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS p02_support_conversations_status_idx
  ON public.p02_support_conversations (status, last_message_at DESC);

ALTER TABLE public.p02_support_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p02_conv_deny_all" ON public.p02_support_conversations AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p02_support_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.p02_support_conversations(id) ON DELETE CASCADE,
  direction       TEXT        NOT NULL CHECK (direction IN ('inbound','outbound')),
  role            TEXT        NOT NULL CHECK (role IN ('visitor','ai','human')),
  body            TEXT        NOT NULL,
  intent          TEXT,
  confidence      NUMERIC(3,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS p02_support_messages_conv_idx
  ON public.p02_support_messages (conversation_id, created_at);

ALTER TABLE public.p02_support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p02_msg_deny_all" ON public.p02_support_messages AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- =============================================================================
-- P03 — TaxPilot
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.p03_support_kb (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          TEXT        NOT NULL CHECK (kind IN ('text','url','faq')),
  source_url    TEXT,
  question      TEXT,
  raw_content   TEXT        NOT NULL DEFAULT '',
  parsed_chunks JSONB       NOT NULL DEFAULT '[]',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p03_support_kb_updated_at ON public.p03_support_kb;
CREATE TRIGGER p03_support_kb_updated_at
  BEFORE UPDATE ON public.p03_support_kb
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

ALTER TABLE public.p03_support_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p03_kb_deny_all" ON public.p03_support_kb AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p03_support_conversations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id       TEXT        NOT NULL,
  is_authenticated BOOLEAN     NOT NULL DEFAULT FALSE,
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','escalated','closed')),
  last_intent      TEXT,
  last_message_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p03_support_conversations_updated_at ON public.p03_support_conversations;
CREATE TRIGGER p03_support_conversations_updated_at
  BEFORE UPDATE ON public.p03_support_conversations
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

CREATE INDEX IF NOT EXISTS p03_support_conversations_visitor_idx
  ON public.p03_support_conversations (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS p03_support_conversations_status_idx
  ON public.p03_support_conversations (status, last_message_at DESC);

ALTER TABLE public.p03_support_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p03_conv_deny_all" ON public.p03_support_conversations AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p03_support_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.p03_support_conversations(id) ON DELETE CASCADE,
  direction       TEXT        NOT NULL CHECK (direction IN ('inbound','outbound')),
  role            TEXT        NOT NULL CHECK (role IN ('visitor','ai','human')),
  body            TEXT        NOT NULL,
  intent          TEXT,
  confidence      NUMERIC(3,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS p03_support_messages_conv_idx
  ON public.p03_support_messages (conversation_id, created_at);

ALTER TABLE public.p03_support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p03_msg_deny_all" ON public.p03_support_messages AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- =============================================================================
-- P04 — TableFlow
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.p04_support_kb (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          TEXT        NOT NULL CHECK (kind IN ('text','url','faq')),
  source_url    TEXT,
  question      TEXT,
  raw_content   TEXT        NOT NULL DEFAULT '',
  parsed_chunks JSONB       NOT NULL DEFAULT '[]',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p04_support_kb_updated_at ON public.p04_support_kb;
CREATE TRIGGER p04_support_kb_updated_at
  BEFORE UPDATE ON public.p04_support_kb
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

ALTER TABLE public.p04_support_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p04_kb_deny_all" ON public.p04_support_kb AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p04_support_conversations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id       TEXT        NOT NULL,
  is_authenticated BOOLEAN     NOT NULL DEFAULT FALSE,
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','escalated','closed')),
  last_intent      TEXT,
  last_message_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p04_support_conversations_updated_at ON public.p04_support_conversations;
CREATE TRIGGER p04_support_conversations_updated_at
  BEFORE UPDATE ON public.p04_support_conversations
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

CREATE INDEX IF NOT EXISTS p04_support_conversations_visitor_idx
  ON public.p04_support_conversations (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS p04_support_conversations_status_idx
  ON public.p04_support_conversations (status, last_message_at DESC);

ALTER TABLE public.p04_support_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p04_conv_deny_all" ON public.p04_support_conversations AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p04_support_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.p04_support_conversations(id) ON DELETE CASCADE,
  direction       TEXT        NOT NULL CHECK (direction IN ('inbound','outbound')),
  role            TEXT        NOT NULL CHECK (role IN ('visitor','ai','human')),
  body            TEXT        NOT NULL,
  intent          TEXT,
  confidence      NUMERIC(3,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS p04_support_messages_conv_idx
  ON public.p04_support_messages (conversation_id, created_at);

ALTER TABLE public.p04_support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p04_msg_deny_all" ON public.p04_support_messages AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- =============================================================================
-- P05 — ConnectOne
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.p05_support_kb (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          TEXT        NOT NULL CHECK (kind IN ('text','url','faq')),
  source_url    TEXT,
  question      TEXT,
  raw_content   TEXT        NOT NULL DEFAULT '',
  parsed_chunks JSONB       NOT NULL DEFAULT '[]',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p05_support_kb_updated_at ON public.p05_support_kb;
CREATE TRIGGER p05_support_kb_updated_at
  BEFORE UPDATE ON public.p05_support_kb
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

ALTER TABLE public.p05_support_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p05_kb_deny_all" ON public.p05_support_kb AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p05_support_conversations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id       TEXT        NOT NULL,
  is_authenticated BOOLEAN     NOT NULL DEFAULT FALSE,
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','escalated','closed')),
  last_intent      TEXT,
  last_message_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p05_support_conversations_updated_at ON public.p05_support_conversations;
CREATE TRIGGER p05_support_conversations_updated_at
  BEFORE UPDATE ON public.p05_support_conversations
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

CREATE INDEX IF NOT EXISTS p05_support_conversations_visitor_idx
  ON public.p05_support_conversations (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS p05_support_conversations_status_idx
  ON public.p05_support_conversations (status, last_message_at DESC);

ALTER TABLE public.p05_support_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p05_conv_deny_all" ON public.p05_support_conversations AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p05_support_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.p05_support_conversations(id) ON DELETE CASCADE,
  direction       TEXT        NOT NULL CHECK (direction IN ('inbound','outbound')),
  role            TEXT        NOT NULL CHECK (role IN ('visitor','ai','human')),
  body            TEXT        NOT NULL,
  intent          TEXT,
  confidence      NUMERIC(3,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS p05_support_messages_conv_idx
  ON public.p05_support_messages (conversation_id, created_at);

ALTER TABLE public.p05_support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p05_msg_deny_all" ON public.p05_support_messages AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- =============================================================================
-- P06 — MachineGuard
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.p06_support_kb (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          TEXT        NOT NULL CHECK (kind IN ('text','url','faq')),
  source_url    TEXT,
  question      TEXT,
  raw_content   TEXT        NOT NULL DEFAULT '',
  parsed_chunks JSONB       NOT NULL DEFAULT '[]',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p06_support_kb_updated_at ON public.p06_support_kb;
CREATE TRIGGER p06_support_kb_updated_at
  BEFORE UPDATE ON public.p06_support_kb
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

ALTER TABLE public.p06_support_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p06_kb_deny_all" ON public.p06_support_kb AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p06_support_conversations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id       TEXT        NOT NULL,
  is_authenticated BOOLEAN     NOT NULL DEFAULT FALSE,
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','escalated','closed')),
  last_intent      TEXT,
  last_message_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS p06_support_conversations_updated_at ON public.p06_support_conversations;
CREATE TRIGGER p06_support_conversations_updated_at
  BEFORE UPDATE ON public.p06_support_conversations
  FOR EACH ROW EXECUTE FUNCTION public.support_set_updated_at();

CREATE INDEX IF NOT EXISTS p06_support_conversations_visitor_idx
  ON public.p06_support_conversations (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS p06_support_conversations_status_idx
  ON public.p06_support_conversations (status, last_message_at DESC);

ALTER TABLE public.p06_support_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p06_conv_deny_all" ON public.p06_support_conversations AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- --

CREATE TABLE IF NOT EXISTS public.p06_support_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.p06_support_conversations(id) ON DELETE CASCADE,
  direction       TEXT        NOT NULL CHECK (direction IN ('inbound','outbound')),
  role            TEXT        NOT NULL CHECK (role IN ('visitor','ai','human')),
  body            TEXT        NOT NULL,
  intent          TEXT,
  confidence      NUMERIC(3,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS p06_support_messages_conv_idx
  ON public.p06_support_messages (conversation_id, created_at);

ALTER TABLE public.p06_support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p06_msg_deny_all" ON public.p06_support_messages AS RESTRICTIVE
  FOR ALL TO anon, authenticated USING (false);

-- =============================================================================
-- Shared-intent note (no schema changes needed)
-- =============================================================================
-- p02_intents rows with workspace_id IS NULL are global "support intents" used
-- by all product support engines. Intent examples:
--   pricing-question, how-do-i, complaint, billing-issue, bug-report, unknown
-- If product-specific intents are needed later, add a product_id TEXT column
-- to p02_intents (ALTER TABLE public.p02_intents ADD COLUMN IF NOT EXISTS product_id TEXT)
-- and filter by product_id OR IS NULL. No data migration required.
-- =============================================================================
