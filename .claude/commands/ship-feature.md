---
description: Run a full feature build cycle — PRD → design → build → test → deploy — for a specified product and feature
argument-hint: [product-id] [feature-name]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Ship a feature: **$ARGUMENTS**

Parse the arguments:
- First token = product ID (e.g., `02-whatsapp-ai-suite`)
- Rest = feature name (e.g., "offline sync for challans")

Run this sequence:

**Stage 1 — Spec (lead: @cto)**
1. `@cto` reads `products/{product-id}/PRD.md`
2. Confirms feature is in scope, has acceptance criteria, and isn't a duplicate
3. If feature not in PRD, file to approval queue: "Feature '{name}' requested but not in PRD. Recommend: {add to PRD / reject / descope to later phase}."
4. If in scope, produces a technical brief: approach, affected files/modules, any new deps, rollout plan

**Stage 2 — Design (lead: @product-designer)**
1. `@product-designer` produces flow doc + wireframes for any UI changes (skip if backend-only)
2. `@design-systems` confirms component specs exist for any new component types
3. `@content-marketer` produces any user-facing copy needed
4. Designer reviews and approves before build starts

**Stage 3 — Build (lead: @cto coordinating dev agents)**
1. `@cto` assigns to specific dev agents:
   - UI-heavy → `@frontend-architect`
   - Marketing/auth/forms → `@ui-builder`
   - API/DB/business logic → `@api-engineer`
   - Infra/deploy/CI → `@infra-engineer`
2. Each dev agent works in a feature branch `feat/{product}-{slug}`
3. PRs include: code, tests, migration (if DB), env var updates
4. `@cto` reviews PR against its code-review criteria (CLAUDE.md has the full list)

**Stage 4 — QA (lead: @product-designer + @cto)**
1. `@product-designer` reviews implementation vs spec
2. `@cto` runs security + performance review
3. Automated tests must pass (unit + relevant e2e)
4. Manual test on preview deploy

**Stage 5 — Deploy (lead: @infra-engineer)**
1. Merge to `main` → CI → production deploy
2. Smoke test post-deploy
3. Monitor Sentry + PostHog for 30 min post-deploy
4. Rollback if regression detected

**Stage 6 — Announce (lead: @cmo coordinating)**
1. `@content-marketer` writes changelog entry + optional blog post + LinkedIn post
2. `@paid-ops-marketer` updates email sequences if the feature changes positioning
3. `@inbound-sales` is briefed so support can answer questions
4. If it's a significant feature: `/launch-product` gets invoked for a coordinated push

**Founder touchpoints during this flow:**
- After Stage 1: approve the scope/approach (one-line)
- After Stage 2: approve design direction (unless using existing patterns, then skip)
- After Stage 3 on any merge to main for customer-facing products
- After Stage 6 before any public announcement

Deliverable summary at the end:
```
✅ Shipped: {feature}
Product: {product}
PRD ref: {link}
PR: {link}
Docs updated: {yes/no}
Metrics to watch: {what to look for in next 7 days}
Rollback if: {specific conditions}
```

Timebox: no single feature should take more than 5 working days from kickoff to merge. If it's bigger, `@cto` must split it before starting.
