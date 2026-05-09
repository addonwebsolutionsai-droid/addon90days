-- Migration 014: CMS layer (cms_categories, cms_posts, cms_faqs)
-- Idempotent. Service-role access only; RLS denies anon + authenticated.
-- product_scope values: 'global' | 'p01' | 'p02' | 'p03' | 'p04' | 'p05' | 'p06'

-- ------------------------------------------------------------------ types ---

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cms_post_status') THEN
    CREATE TYPE cms_post_status AS ENUM ('draft', 'published', 'archived');
  END IF;
END $$;

-- -------------------------------------------------------- cms_categories ----

CREATE TABLE IF NOT EXISTS cms_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
  product_scope TEXT NOT NULL
    CHECK (product_scope IN ('global','p01','p02','p03','p04','p05','p06')),
  kind          TEXT NOT NULL CHECK (kind IN ('blog','faq')),
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  sort_order    INT  NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (kind, product_scope, slug)
);

CREATE INDEX IF NOT EXISTS idx_cms_categories_scope
  ON cms_categories (product_scope, kind, is_active);

ALTER TABLE cms_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_all_cms_categories ON cms_categories;
CREATE POLICY deny_all_cms_categories ON cms_categories
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false);

-- ----------------------------------------------------------- cms_posts ------

CREATE TABLE IF NOT EXISTS cms_posts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT NOT NULL UNIQUE,
  product_scope         TEXT NOT NULL
    CHECK (product_scope IN ('global','p01','p02','p03','p04','p05','p06')),
  category_id           UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL,
  excerpt               TEXT,
  body_md               TEXT NOT NULL DEFAULT '',
  cover_image_url       TEXT,
  tags                  TEXT[] NOT NULL DEFAULT '{}',
  keywords              TEXT[] NOT NULL DEFAULT '{}',
  status                cms_post_status NOT NULL DEFAULT 'draft',
  author_clerk_user_id  TEXT NOT NULL,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  published_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_posts_scope_status
  ON cms_posts (product_scope, status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_cms_posts_tags
  ON cms_posts USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_cms_posts_keywords
  ON cms_posts USING GIN (keywords);

ALTER TABLE cms_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_all_cms_posts ON cms_posts;
CREATE POLICY deny_all_cms_posts ON cms_posts
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false);

-- ------------------------------------------------------------ cms_faqs ------

CREATE TABLE IF NOT EXISTS cms_faqs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_scope TEXT NOT NULL
    CHECK (product_scope IN ('global','p01','p02','p03','p04','p05','p06')),
  category_id   UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
  question      TEXT NOT NULL,
  answer_md     TEXT NOT NULL DEFAULT '',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  keywords      TEXT[] NOT NULL DEFAULT '{}',
  sort_order    INT  NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_faqs_scope
  ON cms_faqs (product_scope, is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_cms_faqs_tags
  ON cms_faqs USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_cms_faqs_keywords
  ON cms_faqs USING GIN (keywords);

ALTER TABLE cms_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_all_cms_faqs ON cms_faqs;
CREATE POLICY deny_all_cms_faqs ON cms_faqs
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false);

-- ------------------------------------------------------- updated_at trigger -

CREATE OR REPLACE FUNCTION cms_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_cms_categories_updated_at ON cms_categories;
CREATE TRIGGER trg_cms_categories_updated_at
  BEFORE UPDATE ON cms_categories
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

DROP TRIGGER IF EXISTS trg_cms_posts_updated_at ON cms_posts;
CREATE TRIGGER trg_cms_posts_updated_at
  BEFORE UPDATE ON cms_posts
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

DROP TRIGGER IF EXISTS trg_cms_faqs_updated_at ON cms_faqs;
CREATE TRIGGER trg_cms_faqs_updated_at
  BEFORE UPDATE ON cms_faqs
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

-- -------------------------------------------------------------- seed data ---

INSERT INTO cms_categories (product_scope, kind, slug, name, description, sort_order)
VALUES
  ('global', 'blog', 'general',      'General',               'Cross-product articles and company news', 0),
  ('p01',    'blog', 'ai-skills',    'AI Skills & MCP',       'Guides for SKILON skill toolkit',         0),
  ('p02',    'blog', 'whatsapp-ai',  'WhatsApp AI',           'ChatBase tips and WhatsApp automation',   0),
  ('p03',    'blog', 'gst-tax',      'GST & Taxation',        'TaxPilot guides and GST compliance',      0),
  ('p04',    'blog', 'restaurant',   'Restaurant Operations', 'TableFlow features and best practices',   0),
  ('global', 'faq',  'general-faq',  'General FAQ',           'Frequently asked questions (global)',     0),
  ('p01',    'faq',  'skills-faq',   'Skills FAQ',            'Questions about SKILON skill toolkit',    0),
  ('p02',    'faq',  'chatbase-faq', 'ChatBase FAQ',          'Questions about WhatsApp AI suite',       0),
  ('p03',    'faq',  'taxpilot-faq', 'TaxPilot FAQ',          'Questions about GST invoicing platform',  0),
  ('p04',    'faq',  'tableflow-faq','TableFlow FAQ',         'Questions about restaurant OS',           0)
ON CONFLICT (kind, product_scope, slug) DO NOTHING;
