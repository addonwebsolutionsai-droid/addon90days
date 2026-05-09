-- ============================================================================
-- Migration 016: tutorials — per-product, per-feature video tutorial system
-- ============================================================================
-- Idempotent: IF NOT EXISTS everywhere.
-- RLS:
--   writes: service-role only (deny-all for anon + authenticated)
--   reads: anon + authenticated may SELECT tutorials (is_active=true) and
--          tutorial_videos; tutorial_views INSERT allowed for anon (analytics).
-- Bucket: `tutorials` (public read, service-role write) — created via
--         Management API in the apply script below.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE tutorial_language_code AS ENUM (
    'en','hi','gu','ta','te','mr','bn','kn','ml','pa'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tutorial_source_kind AS ENUM (
    'original', 'auto_translated', 'human_translated'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- tutorials
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tutorials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      TEXT NOT NULL
                  CHECK (product_id IN ('p01','p02','p03','p04','p05','p06','global')),
  feature_key     TEXT NOT NULL,   -- e.g. 'p02.intent.create'
  title           TEXT NOT NULL,
  description     TEXT,
  sort_order      INT  NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tutorials_product_feature_uniq UNIQUE (product_id, feature_key)
);

-- Keep updated_at in sync automatically
CREATE OR REPLACE FUNCTION tutorials_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tutorials_updated_at ON tutorials;
CREATE TRIGGER trg_tutorials_updated_at
  BEFORE UPDATE ON tutorials
  FOR EACH ROW EXECUTE FUNCTION tutorials_set_updated_at();

-- Fast look-ups from the user-facing widget (most common read pattern)
CREATE INDEX IF NOT EXISTS idx_tutorials_product_active_sort
  ON tutorials (product_id, is_active, sort_order);

-- ---------------------------------------------------------------------------
-- tutorial_videos
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tutorial_videos (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id             UUID NOT NULL
                          REFERENCES tutorials(id) ON DELETE CASCADE,
  language_code           tutorial_language_code NOT NULL,
  video_url               TEXT NOT NULL,
  thumbnail_url           TEXT,
  captions_url            TEXT,             -- WebVTT
  audio_track_url         TEXT,             -- separate translated audio; nullable
  duration_sec            INT,
  is_default              BOOLEAN NOT NULL DEFAULT FALSE,
  source_kind             tutorial_source_kind NOT NULL DEFAULT 'original',
  -- when this video was auto-generated from another language's video
  generated_from_video_id UUID REFERENCES tutorial_videos(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tutorial_videos_lang_uniq UNIQUE (tutorial_id, language_code)
);

-- Enforce at most one default per tutorial at DB level
CREATE UNIQUE INDEX IF NOT EXISTS uidx_tutorial_videos_one_default
  ON tutorial_videos (tutorial_id)
  WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_tutorial_videos_tutorial_id
  ON tutorial_videos (tutorial_id);

-- ---------------------------------------------------------------------------
-- tutorial_views  (append-only analytics)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tutorial_views (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id      UUID NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
  language_code    TEXT NOT NULL,           -- plain text; not the enum (anon may pass stale values)
  clerk_user_id    TEXT,                    -- nullable — anon viewers allowed
  watched_seconds  INT NOT NULL DEFAULT 0,
  completed        BOOLEAN NOT NULL DEFAULT FALSE,
  viewed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutorial_views_tutorial_viewed_at
  ON tutorial_views (tutorial_id, viewed_at DESC);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

-- Tutorials table
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;

-- Public read for active tutorials only
DROP POLICY IF EXISTS "tutorials_public_read" ON tutorials;
CREATE POLICY "tutorials_public_read"
  ON tutorials FOR SELECT
  USING (is_active = TRUE);

-- Writes: service-role bypasses RLS; no explicit policy needed.
-- Belt-and-suspenders: explicitly deny non-service roles.
DROP POLICY IF EXISTS "tutorials_deny_write" ON tutorials;
CREATE POLICY "tutorials_deny_write"
  ON tutorials FOR ALL
  USING (FALSE);

-- Tutorial videos table
ALTER TABLE tutorial_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tutorial_videos_public_read" ON tutorial_videos;
CREATE POLICY "tutorial_videos_public_read"
  ON tutorial_videos FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "tutorial_videos_deny_write" ON tutorial_videos;
CREATE POLICY "tutorial_videos_deny_write"
  ON tutorial_videos FOR ALL
  USING (FALSE);

-- Tutorial views table (anon INSERT allowed for analytics)
ALTER TABLE tutorial_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tutorial_views_anon_insert" ON tutorial_views;
CREATE POLICY "tutorial_views_anon_insert"
  ON tutorial_views FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "tutorial_views_deny_select_update_delete" ON tutorial_views;
CREATE POLICY "tutorial_views_deny_select_update_delete"
  ON tutorial_views FOR SELECT
  USING (FALSE);
