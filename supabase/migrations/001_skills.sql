-- Migration 001: Skills marketplace table

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE skill_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE skill_category AS ENUM (
  'ai-llm', 'iot', 'developer-tools', 'startup-product',
  'ui-ux', 'indian-business', 'data-analytics', 'devops-infra',
  'communication-protocols', 'marketing-growth', 'trading-finance'
);

CREATE TABLE skills (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text        UNIQUE NOT NULL,
  title           text        NOT NULL,
  tagline         text        NOT NULL,
  description     text        NOT NULL,
  category        skill_category NOT NULL,
  subcategory     text,
  tags            text[]      NOT NULL DEFAULT '{}',
  difficulty      skill_difficulty NOT NULL DEFAULT 'beginner',
  price_inr       integer     NOT NULL DEFAULT 0,
  price_usd       integer     NOT NULL DEFAULT 0,
  is_free         boolean     NOT NULL DEFAULT true,
  steps           jsonb       NOT NULL DEFAULT '[]',
  video_url       text,
  video_thumbnail text,
  search_vector   tsvector,
  trending_score  integer     NOT NULL DEFAULT 0,
  view_count      integer     NOT NULL DEFAULT 0,
  purchase_count  integer     NOT NULL DEFAULT 0,
  is_trending     boolean     NOT NULL DEFAULT false,
  is_new          boolean     NOT NULL DEFAULT true,
  is_featured     boolean     NOT NULL DEFAULT false,
  pack_id         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  published       boolean     NOT NULL DEFAULT true
);

-- Indexes
CREATE INDEX idx_skills_category  ON skills(category);
CREATE INDEX idx_skills_trending  ON skills(trending_score DESC);
CREATE INDEX idx_skills_slug      ON skills(slug);
CREATE INDEX idx_skills_published ON skills(published) WHERE published = true;
CREATE INDEX idx_skills_is_free   ON skills(is_free);
CREATE INDEX idx_skills_tags      ON skills USING GIN(tags);
CREATE INDEX idx_skills_search    ON skills USING GIN(search_vector);

-- Trigger function: keep search_vector up to date on insert/update
CREATE OR REPLACE FUNCTION skills_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')),       'A') ||
    setweight(to_tsvector('english', coalesce(NEW.tagline, '')),     'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skills_search_vector_trigger
  BEFORE INSERT OR UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION skills_update_search_vector();

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read published skills (no auth required)
CREATE POLICY "public_read_published"
  ON skills FOR SELECT
  USING (published = true);

-- Service role: full access for server-side admin operations
CREATE POLICY "service_role_all"
  ON skills
  TO service_role
  USING (true)
  WITH CHECK (true);
