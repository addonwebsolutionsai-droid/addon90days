-- Migration 001: Skills marketplace table
-- Run against Supabase project via: supabase db push

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

-- Full-text search column (generated, stored)
ALTER TABLE skills ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')),       'A') ||
    setweight(to_tsvector('english', coalesce(tagline, '')),     'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'D')
  ) STORED;

CREATE INDEX idx_skills_search ON skills USING GIN(search_vector);

-- Auto-update updated_at on any row change
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

-- Service role: full access (used by supabaseAdmin client)
CREATE POLICY "service_role_all"
  ON skills
  USING (auth.role() = 'service_role');
