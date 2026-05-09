-- ============================================================================
-- Migration 013: admin_rbac — role-based access control + audit log
-- ============================================================================
-- Why: founder needs to grant employees scoped admin access (e.g. "content
-- editor can manage CMS but not billing"). Today we have a flat
-- ADMIN_USER_IDS env list which is binary (admin or not). RBAC layers on top
-- without removing it: ADMIN_USER_IDS keeps super-admin "break-glass" power,
-- DB roles add nuance.
--
-- Design rules:
--   - Permissions are namespaced strings: "<scope>.<area>.<action>" so a
--     permission name describes what it gates without ambiguity. Examples:
--       p02.intents.write
--       p03.invoices.refund
--       cms.posts.publish
--       global.audit.read
--   - Roles are bags of permissions. Users get one or more roles.
--   - Audit log is append-only — no delete, no update. Read-only via the
--     admin UI. Stored as JSONB so we don't add a column every time we audit
--     a new resource type.
--
-- Idempotent throughout. Service-role only.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE admin_role_scope AS ENUM ('global','p01','p02','p03','p04','p05','p06');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- admin_permissions — the canonical list of what an admin can do
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_permissions (
  key         TEXT        PRIMARY KEY,                 -- "p02.intents.write"
  scope       TEXT        NOT NULL,                    -- "p02" | "global" | "cms" | ...
  area        TEXT        NOT NULL,                    -- "intents" | "kb" | "billing" | ...
  action      TEXT        NOT NULL,                    -- "read" | "write" | "delete" | "publish" | "refund"
  description TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_permissions: deny anon"          ON public.admin_permissions;
DROP POLICY IF EXISTS "admin_permissions: deny authenticated" ON public.admin_permissions;
CREATE POLICY "admin_permissions: deny anon"
  ON public.admin_permissions FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "admin_permissions: deny authenticated"
  ON public.admin_permissions FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- Seed the canonical permission set. Add new ones via DDL when new admin
-- features ship. This list is the SOURCE of all permission strings — code
-- references must match exactly.
INSERT INTO public.admin_permissions (key, scope, area, action, description) VALUES
  -- Global
  ('global.users.read',        'global', 'users',        'read',    'View the cross-product user list'),
  ('global.users.suspend',     'global', 'users',        'suspend', 'Ban / unban a Clerk user'),
  ('global.audit.read',        'global', 'audit',        'read',    'Read the audit log'),
  ('global.team.read',         'global', 'team',         'read',    'View admin team + role assignments'),
  ('global.team.write',        'global', 'team',         'write',   'Assign / revoke roles to admin users'),

  -- CMS (cross-product)
  ('cms.categories.read',      'cms',    'categories',   'read',    'View CMS categories'),
  ('cms.categories.write',     'cms',    'categories',   'write',   'Create / edit / activate CMS categories'),
  ('cms.posts.read',           'cms',    'posts',        'read',    'View blog posts'),
  ('cms.posts.write',          'cms',    'posts',        'write',   'Create / edit blog posts'),
  ('cms.posts.publish',        'cms',    'posts',        'publish', 'Publish / archive blog posts'),
  ('cms.faqs.read',            'cms',    'faqs',         'read',    'View FAQs'),
  ('cms.faqs.write',           'cms',    'faqs',         'write',   'Create / edit / activate FAQs'),

  -- Billing (cross-product)
  ('billing.plans.read',       'billing', 'plans',       'read',    'View subscription plans'),
  ('billing.plans.write',      'billing', 'plans',       'write',   'Create / edit subscription plans'),
  ('billing.subscriptions.read','billing','subscriptions','read',   'View customer subscriptions'),
  ('billing.subscriptions.cancel','billing','subscriptions','cancel','Cancel a customer subscription'),
  ('billing.invoices.read',    'billing', 'invoices',    'read',    'View invoices'),
  ('billing.refunds.read',     'billing', 'refunds',     'read',    'View refund requests'),
  ('billing.refunds.write',    'billing', 'refunds',     'write',   'Create / approve / reject refund requests'),

  -- P01 SKILON
  ('p01.skills.read',          'p01',    'skills',       'read',    'View skill catalog'),
  ('p01.skills.write',         'p01',    'skills',       'write',   'Create / edit skills'),
  ('p01.skills.publish',       'p01',    'skills',       'publish', 'Publish / unpublish skills'),

  -- P02 ChatBase
  ('p02.workspaces.read',      'p02',    'workspaces',   'read',    'View ChatBase workspaces'),
  ('p02.intents.read',         'p02',    'intents',      'read',    'View intents'),
  ('p02.intents.write',        'p02',    'intents',      'write',   'Create / edit intents'),
  ('p02.kb.read',              'p02',    'kb',           'read',    'View KB documents'),
  ('p02.kb.write',             'p02',    'kb',           'write',   'Create / delete KB documents'),
  ('p02.conversations.read',   'p02',    'conversations','read',    'View conversations'),
  ('p02.conversations.takeover','p02',   'conversations','takeover','Take over / close / reply to conversations'),

  -- P03 TaxPilot
  ('p03.businesses.read',      'p03',    'businesses',   'read',    'View businesses'),
  ('p03.invoices.read',        'p03',    'invoices',     'read',    'View customer invoices'),
  ('p03.invoices.refund',      'p03',    'invoices',     'refund',  'Process invoice refunds (Phase 2)'),

  -- P04 TableFlow
  ('p04.restaurants.read',     'p04',    'restaurants',  'read',    'View restaurants'),
  ('p04.menu.write',           'p04',    'menu',         'write',   'Edit menu items / categories'),
  ('p04.orders.read',          'p04',    'orders',       'read',    'View orders'),

  -- P05 / P06 reserved for now
  ('p05.devices.read',         'p05',    'devices',      'read',    'View IoT devices (placeholder)'),
  ('p06.assets.read',          'p06',    'assets',       'read',    'View industrial assets (placeholder)')

ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- admin_roles — bags of permissions
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT             NOT NULL UNIQUE,        -- "super_admin", "content_editor"
  name        TEXT             NOT NULL,
  description TEXT,
  scope       admin_role_scope NOT NULL DEFAULT 'global',
  is_system   BOOLEAN          NOT NULL DEFAULT FALSE, -- TRUE = built-in, undeletable
  created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_roles: deny anon"          ON public.admin_roles;
DROP POLICY IF EXISTS "admin_roles: deny authenticated" ON public.admin_roles;
CREATE POLICY "admin_roles: deny anon"
  ON public.admin_roles FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "admin_roles: deny authenticated"
  ON public.admin_roles FOR ALL TO authenticated USING (false) WITH CHECK (false);

INSERT INTO public.admin_roles (slug, name, description, scope, is_system) VALUES
  ('super_admin',      'Super Admin',         'Every permission across every product. Cannot be deleted.', 'global', TRUE),
  ('support_agent',    'Support Agent',       'Read-only across products + can take over conversations and request refunds.', 'global', TRUE),
  ('content_editor',   'Content Editor',      'CMS-only across all products.', 'global', TRUE),
  ('finance',          'Finance',             'Plans, billing, invoices, refunds across all products.', 'global', TRUE),
  ('product_admin_p01','Product Admin · P01', 'Full control of SKILON.', 'p01', TRUE),
  ('product_admin_p02','Product Admin · P02', 'Full control of ChatBase.', 'p02', TRUE),
  ('product_admin_p03','Product Admin · P03', 'Full control of TaxPilot.', 'p03', TRUE),
  ('product_admin_p04','Product Admin · P04', 'Full control of TableFlow.', 'p04', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- admin_role_permissions — many-to-many
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
  role_id        UUID NOT NULL REFERENCES public.admin_roles (id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES public.admin_permissions (key) ON DELETE CASCADE,
  granted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_key)
);

ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_role_permissions: deny anon"          ON public.admin_role_permissions;
DROP POLICY IF EXISTS "admin_role_permissions: deny authenticated" ON public.admin_role_permissions;
CREATE POLICY "admin_role_permissions: deny anon"
  ON public.admin_role_permissions FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "admin_role_permissions: deny authenticated"
  ON public.admin_role_permissions FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- Seed: super_admin gets every permission
INSERT INTO public.admin_role_permissions (role_id, permission_key)
SELECT r.id, p.key
FROM public.admin_roles r CROSS JOIN public.admin_permissions p
WHERE r.slug = 'super_admin'
ON CONFLICT DO NOTHING;

-- Seed: support_agent gets all *.read + conversations.takeover + refunds.write
INSERT INTO public.admin_role_permissions (role_id, permission_key)
SELECT r.id, p.key
FROM public.admin_roles r CROSS JOIN public.admin_permissions p
WHERE r.slug = 'support_agent'
  AND (p.action = 'read' OR p.key IN ('p02.conversations.takeover','billing.refunds.write'))
ON CONFLICT DO NOTHING;

-- Seed: content_editor gets cms.* + posts.publish
INSERT INTO public.admin_role_permissions (role_id, permission_key)
SELECT r.id, p.key
FROM public.admin_roles r CROSS JOIN public.admin_permissions p
WHERE r.slug = 'content_editor' AND p.scope = 'cms'
ON CONFLICT DO NOTHING;

-- Seed: finance gets billing.*
INSERT INTO public.admin_role_permissions (role_id, permission_key)
SELECT r.id, p.key
FROM public.admin_roles r CROSS JOIN public.admin_permissions p
WHERE r.slug = 'finance' AND p.scope = 'billing'
ON CONFLICT DO NOTHING;

-- Seed: product_admin_pXX gets pXX.* (per role)
INSERT INTO public.admin_role_permissions (role_id, permission_key)
SELECT r.id, p.key
FROM public.admin_roles r CROSS JOIN public.admin_permissions p
WHERE r.slug = 'product_admin_p01' AND p.scope = 'p01'
ON CONFLICT DO NOTHING;
INSERT INTO public.admin_role_permissions (role_id, permission_key)
SELECT r.id, p.key
FROM public.admin_roles r CROSS JOIN public.admin_permissions p
WHERE r.slug = 'product_admin_p02' AND p.scope = 'p02'
ON CONFLICT DO NOTHING;
INSERT INTO public.admin_role_permissions (role_id, permission_key)
SELECT r.id, p.key
FROM public.admin_roles r CROSS JOIN public.admin_permissions p
WHERE r.slug = 'product_admin_p03' AND p.scope = 'p03'
ON CONFLICT DO NOTHING;
INSERT INTO public.admin_role_permissions (role_id, permission_key)
SELECT r.id, p.key
FROM public.admin_roles r CROSS JOIN public.admin_permissions p
WHERE r.slug = 'product_admin_p04' AND p.scope = 'p04'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- admin_user_roles — Clerk user → role assignments
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_user_roles (
  clerk_user_id TEXT        NOT NULL,
  role_id       UUID        NOT NULL REFERENCES public.admin_roles (id) ON DELETE CASCADE,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by   TEXT,                                  -- the assigning admin's clerk_user_id
  PRIMARY KEY (clerk_user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_user ON public.admin_user_roles (clerk_user_id);

ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_user_roles: deny anon"          ON public.admin_user_roles;
DROP POLICY IF EXISTS "admin_user_roles: deny authenticated" ON public.admin_user_roles;
CREATE POLICY "admin_user_roles: deny anon"
  ON public.admin_user_roles FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "admin_user_roles: deny authenticated"
  ON public.admin_user_roles FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ----------------------------------------------------------------------------
-- admin_audit_log — append-only record of every admin mutation
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_clerk_user_id TEXT  NOT NULL,                  -- who performed the action
  action        TEXT        NOT NULL,                  -- e.g. "p02.intents.update"
  resource_type TEXT        NOT NULL,                  -- e.g. "p02_intents"
  resource_id   TEXT,                                  -- the row id, nullable for non-row actions
  scope         TEXT,                                  -- e.g. "p02" — for filtering admin views
  before_json   JSONB,                                 -- nullable; pre-state for updates/deletes
  after_json    JSONB,                                 -- nullable; post-state for creates/updates
  ip            TEXT,                                  -- request IP (best-effort)
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor   ON public.admin_audit_log (actor_clerk_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_scope   ON public.admin_audit_log (scope, created_at DESC) WHERE scope IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_action  ON public.admin_audit_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.admin_audit_log (resource_type, resource_id, created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_audit_log: deny anon"          ON public.admin_audit_log;
DROP POLICY IF EXISTS "admin_audit_log: deny authenticated" ON public.admin_audit_log;
CREATE POLICY "admin_audit_log: deny anon"
  ON public.admin_audit_log FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "admin_audit_log: deny authenticated"
  ON public.admin_audit_log FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ----------------------------------------------------------------------------
-- updated_at trigger for admin_roles only (other RBAC rows are append-only)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_roles_updated_at ON public.admin_roles;
CREATE TRIGGER trg_admin_roles_updated_at
  BEFORE UPDATE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.admin_set_updated_at();
