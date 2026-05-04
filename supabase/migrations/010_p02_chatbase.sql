-- ============================================================================
-- Migration 010: p02_chatbase — ChatBase WhatsApp AI Business Suite
-- ============================================================================
-- All tables prefixed with p02_ to avoid collision with P01 toolkit tables.
-- RLS: service-role only. Dashboard routes authenticate via Clerk and scope
-- all queries by workspace_id using the service-role client.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE p02_kb_kind          AS ENUM ('text', 'url', 'pdf');
  CREATE TYPE p02_conv_status      AS ENUM ('active', 'escalated', 'closed');
  CREATE TYPE p02_msg_direction    AS ENUM ('inbound', 'outbound');
  CREATE TYPE p02_msg_role         AS ENUM ('customer', 'ai', 'human');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- p02_workspaces
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.p02_workspaces (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_clerk_user_id       TEXT        NOT NULL,
  business_name             TEXT        NOT NULL,
  timezone                  TEXT        NOT NULL DEFAULT 'Asia/Kolkata',
  locale                    TEXT        NOT NULL DEFAULT 'en',
  escalation_threshold      NUMERIC     NOT NULL DEFAULT 0.7 CHECK (escalation_threshold >= 0 AND escalation_threshold <= 1),
  mock_mode                 BOOLEAN     NOT NULL DEFAULT TRUE,
  whatsapp_phone_number_id  TEXT,
  whatsapp_access_token_enc BYTEA,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p02_workspaces_owner
  ON public.p02_workspaces (owner_clerk_user_id);

ALTER TABLE public.p02_workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "p02_workspaces: deny anon"          ON public.p02_workspaces;
DROP POLICY IF EXISTS "p02_workspaces: deny authenticated" ON public.p02_workspaces;

CREATE POLICY "p02_workspaces: deny anon"
  ON public.p02_workspaces FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "p02_workspaces: deny authenticated"
  ON public.p02_workspaces FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p02_kb_docs — knowledge base documents
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.p02_kb_docs (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   UUID          NOT NULL REFERENCES public.p02_workspaces (id) ON DELETE CASCADE,
  kind           p02_kb_kind   NOT NULL,
  source_url     TEXT,
  raw_content    TEXT          NOT NULL DEFAULT '',
  parsed_chunks  JSONB         NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p02_kb_docs_workspace
  ON public.p02_kb_docs (workspace_id);

ALTER TABLE public.p02_kb_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "p02_kb_docs: deny anon"          ON public.p02_kb_docs;
DROP POLICY IF EXISTS "p02_kb_docs: deny authenticated" ON public.p02_kb_docs;

CREATE POLICY "p02_kb_docs: deny anon"
  ON public.p02_kb_docs FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "p02_kb_docs: deny authenticated"
  ON public.p02_kb_docs FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p02_intents
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.p02_intents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID        REFERENCES public.p02_workspaces (id) ON DELETE CASCADE,
  -- NULL workspace_id = global default intent (seeded below)
  intent_key    TEXT        NOT NULL,
  name          TEXT        NOT NULL,
  system_prompt TEXT        NOT NULL,
  threshold     NUMERIC     NOT NULL DEFAULT 0.7 CHECK (threshold >= 0 AND threshold <= 1),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, intent_key)
);

CREATE INDEX IF NOT EXISTS idx_p02_intents_workspace
  ON public.p02_intents (workspace_id);

ALTER TABLE public.p02_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "p02_intents: deny anon"          ON public.p02_intents;
DROP POLICY IF EXISTS "p02_intents: deny authenticated" ON public.p02_intents;

CREATE POLICY "p02_intents: deny anon"
  ON public.p02_intents FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "p02_intents: deny authenticated"
  ON public.p02_intents FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- Seed the 6 global default intents (workspace_id NULL = global)
INSERT INTO public.p02_intents (workspace_id, intent_key, name, system_prompt, threshold) VALUES
  (NULL, 'price-inquiry', 'Price Inquiry',
   'You are a helpful business assistant. The customer is asking about the price of a product or service. Use the knowledge base context below to answer accurately. Keep your reply under 1600 characters. Be friendly and direct. If you do not find the price, say you will check and get back to them.',
   0.6),
  (NULL, 'order-placement', 'Order Placement',
   'You are a helpful business assistant. The customer wants to place an order. Acknowledge their intent, collect any missing details (product, quantity, delivery address if applicable), and confirm the order summary. Keep your reply under 1600 characters. Be friendly and concise.',
   0.6),
  (NULL, 'invoice-request', 'Invoice Request',
   'You are a helpful business assistant. The customer is requesting an invoice or bill. Acknowledge the request and let them know the invoice will be shared shortly. If you need any details (order number, date), ask for them. Keep your reply under 1600 characters.',
   0.6),
  (NULL, 'payment-status', 'Payment Status',
   'You are a helpful business assistant. The customer is asking about a payment they made or a pending payment. Use the knowledge base context to answer if possible. If you cannot confirm, let them know you will check and revert. Keep your reply under 1600 characters.',
   0.6),
  (NULL, 'complaint', 'Complaint',
   'You are a helpful business assistant. The customer has a complaint or is expressing dissatisfaction. Acknowledge their concern empathetically and let them know a team member will follow up shortly. Do NOT attempt to resolve the complaint yourself. Keep your reply under 1600 characters.',
   1.0),
  (NULL, 'unknown', 'Unknown / Clarification',
   'You are a helpful business assistant. The customer sent a message that is unclear or does not fit a known category. Ask a polite clarifying question to understand what they need. Keep your reply under 1600 characters. Do not guess — ask.',
   1.0)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- p02_conversations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.p02_conversations (
  id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID              NOT NULL REFERENCES public.p02_workspaces (id) ON DELETE CASCADE,
  customer_phone  TEXT              NOT NULL,
  customer_name   TEXT,
  last_intent     TEXT,
  status          p02_conv_status   NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p02_conversations_workspace
  ON public.p02_conversations (workspace_id);

CREATE INDEX IF NOT EXISTS idx_p02_conversations_workspace_status
  ON public.p02_conversations (workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_p02_conversations_updated
  ON public.p02_conversations (updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_p02_conversations_workspace_phone
  ON public.p02_conversations (workspace_id, customer_phone)
  WHERE status != 'closed';

ALTER TABLE public.p02_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "p02_conversations: deny anon"          ON public.p02_conversations;
DROP POLICY IF EXISTS "p02_conversations: deny authenticated" ON public.p02_conversations;

CREATE POLICY "p02_conversations: deny anon"
  ON public.p02_conversations FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "p02_conversations: deny authenticated"
  ON public.p02_conversations FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- p02_messages
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.p02_messages (
  id               UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID               NOT NULL REFERENCES public.p02_conversations (id) ON DELETE CASCADE,
  direction        p02_msg_direction  NOT NULL,
  body             TEXT               NOT NULL,
  intent           TEXT,
  confidence       NUMERIC            CHECK (confidence >= 0 AND confidence <= 1),
  role             p02_msg_role       NOT NULL,
  meta_message_id  TEXT,              -- WhatsApp message ID from Meta API (null in mock mode)
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p02_messages_conversation
  ON public.p02_messages (conversation_id);

CREATE INDEX IF NOT EXISTS idx_p02_messages_conversation_created
  ON public.p02_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_p02_messages_meta_id
  ON public.p02_messages (meta_message_id)
  WHERE meta_message_id IS NOT NULL;

ALTER TABLE public.p02_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "p02_messages: deny anon"          ON public.p02_messages;
DROP POLICY IF EXISTS "p02_messages: deny authenticated" ON public.p02_messages;

CREATE POLICY "p02_messages: deny anon"
  ON public.p02_messages FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "p02_messages: deny authenticated"
  ON public.p02_messages FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- updated_at auto-update trigger (shared)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.p02_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_p02_workspaces_updated_at ON public.p02_workspaces;
CREATE TRIGGER trg_p02_workspaces_updated_at
  BEFORE UPDATE ON public.p02_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.p02_set_updated_at();

DROP TRIGGER IF EXISTS trg_p02_conversations_updated_at ON public.p02_conversations;
CREATE TRIGGER trg_p02_conversations_updated_at
  BEFORE UPDATE ON public.p02_conversations
  FOR EACH ROW EXECUTE FUNCTION public.p02_set_updated_at();
