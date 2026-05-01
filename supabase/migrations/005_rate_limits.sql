-- ============================================================================
-- Migration 005: rate_limits — protect Groq free-tier quota at /api/chat and /api/skills/run
-- ============================================================================
-- Why: Groq's free tier is 14,400 RPD shared across the whole site. One
-- scraper, one bot, one curious HN visitor running a script can drain
-- the daily budget during peak conversion. Once drained, every signup-
-- funnel "Try Live" demo silently breaks at the worst possible moment.
--
-- Approach: fixed-window counter per (key, window). Atomic upsert via a
-- SECURITY DEFINER function so we don't race between SELECT and UPDATE.
-- Server uses service-role key which bypasses RLS.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          TEXT        PRIMARY KEY,
  count        INT         NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
  ON public.rate_limits (window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Lock down to service-role only. RPC below uses SECURITY DEFINER so it works
-- regardless of the caller's role; we still defense-in-depth deny anon/auth.
DROP POLICY IF EXISTS "rate_limits: deny anon"          ON public.rate_limits;
DROP POLICY IF EXISTS "rate_limits: deny authenticated" ON public.rate_limits;

CREATE POLICY "rate_limits: deny anon"
  ON public.rate_limits FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "rate_limits: deny authenticated"
  ON public.rate_limits FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ============================================================================
-- check_rate_limit — atomic increment-and-check
-- ============================================================================
-- Returns:
--   allowed       boolean — true iff caller is within budget after this call
--   current_count int     — count in the current window after increment
--   reset_at      timestamptz — when the current window expires
--
-- Behavior:
--   - If no row for key, INSERT with count=1, window_start=now().
--   - If row exists and window_start older than p_window_seconds, RESET to count=1.
--   - Else INCREMENT count.
--   - Compare new count against p_limit. allowed = count <= limit.
--
-- Race-safety: ON CONFLICT DO UPDATE is atomic. No SELECT-then-UPDATE window.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key             TEXT,
  p_limit           INT,
  p_window_seconds  INT
) RETURNS TABLE (
  allowed       BOOLEAN,
  current_count INT,
  reset_at      TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count          INT;
  v_window_start   TIMESTAMPTZ;
  v_window_expired BOOLEAN;
BEGIN
  INSERT INTO public.rate_limits AS rl (key, count, window_start)
  VALUES (p_key, 1, NOW())
  ON CONFLICT (key) DO UPDATE
    SET count = CASE
                  WHEN rl.window_start < NOW() - (p_window_seconds || ' seconds')::INTERVAL
                    THEN 1
                  ELSE rl.count + 1
                END,
        window_start = CASE
                         WHEN rl.window_start < NOW() - (p_window_seconds || ' seconds')::INTERVAL
                           THEN NOW()
                         ELSE rl.window_start
                       END
  RETURNING rl.count, rl.window_start INTO v_count, v_window_start;

  RETURN QUERY
    SELECT
      v_count <= p_limit                                                   AS allowed,
      v_count                                                              AS current_count,
      v_window_start + (p_window_seconds || ' seconds')::INTERVAL          AS reset_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;

-- ============================================================================
-- Optional cleanup: prune old rows once a day so the table doesn't grow
-- forever from one-time visitors. Run via cron or by hand.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prune_rate_limits(p_older_than_seconds INT DEFAULT 86400)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM public.rate_limits
   WHERE window_start < NOW() - (p_older_than_seconds || ' seconds')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.prune_rate_limits(INT) TO service_role;
