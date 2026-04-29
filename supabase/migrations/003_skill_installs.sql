-- ============================================================================
-- Migration 003: skill_installs analytics table
-- ============================================================================
-- Captures every successful install during public beta. Used for:
--   - Activation analytics (which skills get installed most?)
--   - "Recently installed" recommendations
--   - Email targeting once we turn on pricing (hot users by install count)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.skill_installs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id    UUID        NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL,
  user_id     TEXT        NOT NULL,                 -- Clerk user_id (TEXT, not UUID)
  source      TEXT        NOT NULL DEFAULT 'web',   -- 'web' | 'cli' | 'mcp'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_installs_user      ON public.skill_installs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_installs_skill     ON public.skill_installs(skill_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_installs_slug      ON public.skill_installs(slug);

-- RLS: writes happen only via service-role client. Authed users can read their own row.
ALTER TABLE public.skill_installs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.skill_installs;
CREATE POLICY "service_role_all" ON public.skill_installs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- RPC: increment_skill_install
-- ============================================================================
-- Atomically bumps purchase_count on the skill row. Called from the install
-- endpoint so trending/most-used sorting reflects real activation volume.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_skill_install(skill_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.skills
  SET purchase_count = purchase_count + 1,
      updated_at     = NOW()
  WHERE slug = skill_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_skill_install(TEXT) TO anon, authenticated, service_role;
