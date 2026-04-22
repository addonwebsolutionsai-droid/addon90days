# Design Standards

**The quality bar for every frontend, backend, and visual design decision across our 6 products.**

Agents reference this file before writing code or visual specs. Founder reviews against this standard.

---

## Guiding principle

> Boring, clean, fast, obvious. Delight comes from how the product works, not from design trickery.

Every design choice answers: "Would a user who has used Linear, Stripe, and Vercel feel at home here?" If yes, ship it. If it's trying to be different for difference's sake, reject.

---

## Inspiration library (benchmark references)

Our baseline is best-in-class software. When agents design, they reference these — not their own memory.

### Best-in-class frontend references

**SaaS dashboards (study these for info density + polish):**
- Linear.app — the gold standard for keyboard-first productivity UI
- Stripe Dashboard — financial data density done right
- Vercel Dashboard — developer-facing simplicity
- PostHog — complex analytics made approachable
- Attio / Notion — structured data with flexible display

**Landing pages (study for conversion + clarity):**
- Stripe.com — the template for technical-product landings
- Resend.com — developer-focused simplicity
- Cal.com — personal + professional balance
- Arc.net — distinctive without being weird
- Railway.app — colorful but disciplined

**Mobile apps (study for mobile-first UX):**
- Linear mobile — desktop complexity mapped to mobile sensibly
- Revolut — dense finance features, great mobile-first patterns
- Duolingo — onboarding perfection
- Things 3 — focused, one-job-done-well

**Dev tools (for P01 Claude Toolkit):**
- GitHub, Vercel, Fly.io dashboards — the standards our dev buyers know

### Best-in-class backend references

**API design:**
- Stripe API — the industry reference for REST API design
- Linear API — modern GraphQL done cleanly
- GitHub API — mature, well-versioned

**Error handling:**
- Every error envelope has `code`, `message`, optional `details`, optional `doc_url`
- Errors are categorized: user_error / system_error / integration_error
- Error messages tell users WHAT went wrong AND what to do next

**Database patterns:**
- Supabase public schema conventions (row-level security, generated columns)
- `created_at` / `updated_at` / `deleted_at` on every table
- UUIDs v7 for primary keys (time-ordered, sortable)

---

## Frontend quality bar (enforced on every PR)

### Performance (non-negotiable)

- **Lighthouse score 95+** on every public landing page
- **Largest Contentful Paint (LCP) < 1.5s** on 4G
- **Cumulative Layout Shift (CLS) < 0.1**
- **First Input Delay (FID) < 100ms**
- **Bundle size:** initial route under 200KB gzipped for public pages, under 400KB for authenticated app routes
- Images via `next/image` with explicit dimensions always
- Fonts self-hosted via `next/font`

### Accessibility (non-negotiable)

- Semantic HTML first, ARIA only where semantic HTML can't express it
- Keyboard nav works end-to-end on every flow
- Focus states visible on every interactive element
- Color contrast AA minimum, AAA for critical text
- Screen reader-tested on primary user flows
- Every image has alt text; decorative images have `alt=""`

### Mobile-first (non-negotiable)

- Designed at 375px width first, desktop second
- Touch targets 48x48px minimum
- No hover-only interactions (hover must have an equivalent tap/click path)
- Tested on real devices, not just Chrome DevTools emulation

### Visual polish

- **Spacing:** consistent 4px-based scale. Nothing off-grid.
- **Typography:** one display font + one body font per product. No more.
- **Color usage:** 90% neutrals + 10% brand color. Not the other way around.
- **Shadows:** use sparingly. Prefer borders for separation.
- **Animations:** reserve for meaningful state changes. No decorative motion.
- **Icons:** Lucide is the default. Single weight, consistent stroke.
- **Illustrations:** avoid stock illustrations (Humaaans, unDraw) — they scream "AI-generated SaaS." Use our own custom simple icons or screenshots.

### Component rules

- shadcn/ui is the baseline; customize via tokens, don't rewrite
- Never mix two component libraries in one product
- Every component has all states: default, hover, focus, active, disabled, loading, error, empty
- Every form field has: label, optional description, error state, success state
- Every list has empty state with CTA
- Every async action shows loading, success, and error states

---

## Backend quality bar

### API design (see `.claude/agents/api-engineer.md` for full spec)

- REST first, always versioned `/api/v1/`
- Zod validation on every boundary — no exceptions
- Idempotency keys on any mutation that costs money or sends a message
- Pagination on every list (cursor-based, default)
- Rate limits on every endpoint
- Auth on everything by default; explicit `public: true` to open it

### Data layer

- Migrations always, never manual DB edits
- Soft delete by default (`deleted_at` timestamp)
- Multi-tenant via `organization_id`, enforced at middleware level
- Every FK has an index, every WHERE column has an index
- No N+1 queries — audited quarterly with slow-query logs

### Observability

- Every API request logs: user, request ID, duration, status
- Every error goes to Sentry with full context (user ID, request ID, stack)
- Every critical business event (signup, payment, churn) emits to PostHog
- Dashboards for: error rate, p95 latency, throughput, per-endpoint cost

### Security

- Secrets in env vars, never in code, never logged
- CORS allowlist only, never `*` in production
- CSRF protection on browser-client endpoints
- All user input treated as hostile
- All external data (webhook, API response) validated with Zod before use
- Webhook signatures always verified

---

## Visual design inspiration sources (check these per product)

Per product, agents should pull inspiration based on which product they're designing for:

| Product | Visual inspiration (study these before designing) |
|---|---|
| 01 Claude Toolkit | Vercel, Fly, Railway — dev tool standards |
| 02 ChatBase | WhatsApp Business app (familiar baseline), Intercom (professional inbox), Freshdesk (multi-agent) |
| 03 TaxPilot | Zoho Books India, ClearTax, Stripe Dashboard (enterprise gravitas for finance) |
| 04 TableFlow | Toast POS, Square POS, Petpooja — familiar to restaurant staff |
| 05 ConnectOne | Vercel (dev surface), AWS Console (familiar to enterprise IoT buyers but cleaner), Datadog (for dashboards) |
| 06 MachineGuard | Datadog (alert-rich dashboards), Splunk (industrial data feel), Grafana (time-series) |

See `inspiration/` directory for more specific per-product references you drop in manually.

---

## Critical: Before any design work, read `inspiration/`

The `inspiration/` directory is YOUR (founder's) space. Drop in URLs, screenshots descriptions, brand references, anything you've seen and liked. Agents read these BEFORE designing.

Without those refs, agents default to generic best-practice. With them, designs match your taste.

---

## Anti-patterns (reject these in PR review)

### Frontend
- Gradient-everywhere backgrounds (2021 SaaS aesthetic)
- Stock illustrations of people using laptops
- Carousels for testimonials (they reduce conversion; show 3-6 visible instead)
- "Glassmorphism" / frosted backgrounds unless it serves the content
- Dark mode that's just an inverted palette, not a designed dark theme
- Hamburger menus on desktop (hide nav from users)
- Infinite scroll where pagination is better
- Modal-everything (prefer inline where possible)

### Backend
- Default exports
- `any` type
- String concatenation in SQL
- Synchronous I/O in request handlers
- Unhandled promise rejections
- Missing error states for external calls

### Product copy
- "Seamless", "robust", "cutting-edge", "game-changer" — see `operations/brand-voice.md`
- Stock photos of people pointing at laptops
- "Used by teams at {big company}" without permission
- Statistics without sources

---

## Process: "Claude Code design" workflow

When the user says "design the front end of X":

1. `@product-designer` reads:
   - Relevant product PRD
   - This file (DESIGN_STANDARDS.md)
   - Relevant `inspiration/` files
   - `operations/brand-voice.md`

2. Produces:
   - Flow document (user journey through the feature)
   - Wireframe (text-based, structural)
   - Copy brief for `@content-marketer`
   - Design token reference list

3. `@design-systems` reviews spec for token compliance

4. `@content-marketer` fills in copy per brief

5. `@ui-builder` or `@frontend-architect` implements:
   - Loads the Claude Code `frontend-design` skill if available
   - Follows spec exactly
   - Self-reviews vs. this file before PR

6. `@product-designer` reviews the PR before merge

This sequence ensures every design is grounded in references, not invented from scratch.

---

## When to use Claude Code's `frontend-design` skill

For any non-trivial frontend work (landing pages, dashboards, app UIs), `@ui-builder` and `@frontend-architect` should invoke the `frontend-design` skill at the start of the task. It has specific guidance on:
- Design tokens for this environment
- Component patterns
- Styling constraints

This skill + our design standards + the inspiration refs = a disciplined design process.
