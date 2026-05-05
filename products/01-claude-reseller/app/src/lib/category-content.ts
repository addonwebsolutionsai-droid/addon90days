/**
 * Per-category landing page content for /skills/category/[slug].
 *
 * Each entry is the SEO copy for that category: an H1, an opening
 * paragraph (~80 words), a body section (~200-300 words), and a
 * meta description for the title tag. Hand-written, not auto-
 * generated, because category pages are the highest-leverage
 * SEO surface we have — they target medium-tail queries
 * ("claude skills for [category]") that drive 5-20k organic
 * visitors per page per month at full ranking.
 *
 * Content principles:
 * - Specific not generic. "GST invoicing, Tally exports, IRN" not
 *   "Indian business tools."
 * - Practitioner-led. We ship the work; we know the pain.
 * - Mention the artifact the skill produces (PDF, query, scaffold).
 * - 300-500 words minimum per category — Google rewards depth.
 */

export interface CategoryContent {
  slug:           string;
  label:          string;
  emoji:          string;
  color:          string;
  /** Title tag (≤ 60 chars). */
  titleTag:       string;
  /** Meta description (≤ 160 chars). */
  metaDescription: string;
  /** H1 (≤ 80 chars). */
  h1:             string;
  /** Hero paragraph (~80 words). Shown above the skill grid. */
  hero:           string;
  /** Body paragraphs (~200-300 words). Shown below the grid for SEO depth. */
  body:           string[];
  /** Adjacent category slugs for cross-linking footer. 3 picks. */
  related:        string[];
}

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  "indian-business": {
    slug:  "indian-business",
    label: "Indian Business",
    emoji: "🇮🇳",
    color: "#f97316",
    titleTag:        "Claude Skills for Indian Business — GST, Tally, Invoicing | SKILON",
    metaDescription: "Production-ready Claude skills for Indian SMBs: GST invoice generator, GSTR filing, Tally exports, e-invoice IRN, payment reminders in Hindi. Free for the first year.",
    h1:    "Claude Skills for Indian Business",
    hero:  "Tools that automate the manual work of running an Indian SMB — GST invoicing, GSTR-1/3B filing, Tally exports, e-invoice IRN, payment reminders in Hindi. Built for owners who run their company from WhatsApp and don't want to hire a full-time accountant. Each skill is a complete production playbook: paste the install command, run it in Claude Code, get the output. No chatbot back-and-forth, no fluff.",
    body: [
      "India runs on small businesses. 63 million MSMEs, ₹50 lakh — ₹5 crore in annual revenue, 1–50 employees. Most of them spend 3–5 hours a day on WhatsApp, chase outstanding invoices manually every month, and miss GST filing deadlines because GSTR-1 is a 4-hour exercise nobody enjoys. The result: revenue leaks, ITC missed, stress that scales with the business.",
      "SKILON's Indian Business category is the production playbook for this work. The GST invoice generator produces CGST/SGST/IGST-correct invoices with HSN codes and IRN in one prompt. The GSTR filing assistant compiles your sales data, reconciles against GSTR-2A, and produces a filing-ready return — push it to GSTN with one API call. The payment reminder bot sends WhatsApp reminders in Hindi 3 days before due, on due date, and 3 days after, tracking who paid via webhook.",
      "Why these skills work better than the generic AI coding tools: they understand Indian regulatory context. GST rates per HSN. State-wise CGST/SGST split. e-Invoice JSON schema for the IRP. Tally voucher structure. Hindi/Hinglish/Gujarati customer messaging conventions. Every skill in this category was built by engineers who shipped real systems for real CA firms, retailers, and distribution businesses across Gujarat, Maharashtra, and Karnataka.",
      "Free for the first year. Sign in to install via npm or Claude Desktop MCP. Try any skill live in your browser before installing.",
    ],
    related: ["data-analytics", "marketing-growth", "developer-tools"],
  },

  "iot": {
    slug:  "iot",
    label: "IoT & Hardware",
    emoji: "📡",
    color: "#06b6d4",
    titleTag:        "Claude Skills for IoT & Hardware — ESP32, MQTT, OTA | SKILON",
    metaDescription: "Production-ready Claude skills for IoT engineers: ESP32 firmware scaffolds, MQTT broker setup, OTA pipelines, sensor protocol bridges. Battle-tested. Free for the first year.",
    h1:    "Claude Skills for IoT & Hardware",
    hero:  "ESP32 firmware scaffolds, MQTT broker setups, OTA update pipelines, Modbus/CoAP/CAN protocol bridges, sensor anomaly detection. Built by engineers who shipped IoT for industrial clients in the US, Canada, Dubai, and India. Each skill is runnable code, not pseudocode — drop it into your project, flash the device, ship.",
    body: [
      "IoT is the long tail of software. The browser-app world ships features in days; the firmware world ships in months because every project starts from scratch. Even mature teams spend the first two weeks of every device project re-creating the same boilerplate: FreeRTOS task setup, Wi-Fi provisioning, MQTT broker connection, OTA update plumbing, telemetry buffering, watchdog timers. None of it is hard. All of it is repetitive.",
      "SKILON's IoT category is the production playbook for that work. The ESP32 firmware scaffold generates a complete project structure with FreeRTOS, MQTT, OTA, and power management baked in — including PlatformIO config and CI build steps. The MQTT broker setup produces a Mosquitto config + auth + TLS termination ready to deploy. The OTA pipeline scaffold gives you an end-to-end update flow: signing, manifest publish, device-side verify, rollback on boot failure.",
      "These aren't toy examples. They're the same patterns we use for industrial IoT clients across vibration monitoring, cold-chain logistics, and predictive maintenance. The scaffolding decisions (mbedTLS over WolfSSL, NVS over SPIFFS for config, dual-bank A/B partitions for OTA) reflect what survived production deployments — not what the documentation makes look easy.",
      "Pair these skills with our SKILON sister products ConnectOne (IoT plug-and-play platform) and MachineGuard (predictive maintenance AI) for a complete industrial IoT stack. Free for the first year. Sign in to install.",
    ],
    related: ["communication-protocols", "devops-infra", "data-analytics"],
  },

  "developer-tools": {
    slug:  "developer-tools",
    label: "Developer Tools",
    emoji: "⚡",
    color: "#f59e0b",
    titleTag:        "Claude Skills for Developer Tools — SQL, Code Review | SKILON",
    metaDescription: "Production-ready Claude skills for developers: SQL query builder, code reviewer, PR description writer, test generator, prompt optimizer. Free for the first year.",
    h1:    "Claude Skills for Developer Tools",
    hero:  "SQL query builders, code reviewers, PR description writers, test generators, API doc writers, regex builders, prompt optimizers. Skills that turn the repetitive 20% of engineering work into a paste-and-go workflow. Built by people who run a 13-agent AI company — we use these skills ourselves every day.",
    body: [
      "Engineering productivity isn't about clever tools. It's about removing the 20% of tasks that drain 50% of your day: writing the same SQL joins for the fifth time this week, drafting a PR description that nobody reads, regenerating test scaffolds for a new endpoint, optimizing a prompt that's 80% there. Each task takes 10–30 minutes; each is mechanically the same; each is a perfect Claude skill.",
      "SKILON's Developer Tools category captures these. The SQL query builder takes a plain-English description and returns optimized PostgreSQL/MySQL/Snowflake-ready SQL with proper joins, CTEs, and window functions. The code reviewer runs OWASP Top 10 + type safety + performance heuristics on a file or PR diff and returns prioritized findings. The PR description writer reads a git diff and produces a structured Markdown PR body with summary, test plan, and risk callouts.",
      "Why these are skills (not just prompts): each skill ships as a slash command in Claude Code (`/code-reviewer`, `/sql-query-builder`) and as an MCP tool in Claude Desktop. Every install is one command (`npx addonweb-claude-skills install <slug>`). No prompt copy-paste. No tab-switching to a chatbot. The workflow is `git diff | claude /code-reviewer` and you're done.",
      "Pair with the IoT and Indian Business categories for verticals; pair with DevOps & Infra for ship pipelines. Free for the first year. Sign in to install.",
    ],
    related: ["devops-infra", "data-analytics", "ai-llm"],
  },

  "trading-finance": {
    slug:  "trading-finance",
    label: "Trading & Finance",
    emoji: "📉",
    color: "#eab308",
    titleTag:        "Claude Skills for Trading & Finance — NSE, Backtest | SKILON",
    metaDescription: "Claude skills for traders + quants: NSE/BSE stock screener, backtesting framework, options strategy builder, fundamental analysis. Free for the first year.",
    h1:    "Claude Skills for Trading & Finance",
    hero:  "NSE/BSE/NYSE stock screeners, backtesting frameworks, options strategy builders, fundamental analysis, crypto trading bots, technical indicator scaffolds. Built for the retail-to-prosumer trader who can read code but doesn't have a quant team. Each skill ships with real exchange API plumbing — not toy CSV examples.",
    body: [
      "Retail trading in India crossed 10 crore demat accounts in 2025. Most of those traders are using brokerage screens, copying TradingView setups, and reading borrowed-conviction Twitter threads. The ones who outperform have one thing in common: they treat their trading like a system. Universe definition, screener, entry/exit rules, position sizing, journaling. The system isn't fancy — it's just consistent.",
      "SKILON's Trading & Finance category is the production playbook for that system. The NSE stock screener scans the universe with 20+ technical filters (RSI, MACD, Bollinger bands, volume surge, 52-week breakouts) and exports ranked candidates with confidence scores to Google Sheets. The options strategy builder takes a directional thesis (bullish/bearish/neutral) and the underlying's IV percentile, returns concrete strategies (iron condor, vertical spread, calendar) with strike/expiry recommendations.",
      "The backtesting framework runs your rules over 5 years of NSE data with realistic slippage, brokerage, and STT — not the pristine numbers most trading-Twitter screenshots use. Every output is exportable as CSV for your own journal or as a Google Sheets URL with conditional formatting baked in. We don't promise alpha; we ship the systematization.",
      "Bridge to broker APIs (Zerodha Kite, Angel SmartAPI, IBKR) included in the API setup skills. Free for the first year. Sign in to install.",
    ],
    related: ["data-analytics", "indian-business", "developer-tools"],
  },

  "ai-llm": {
    slug:  "ai-llm",
    label: "AI & LLM",
    emoji: "🤖",
    color: "#8b5cf6",
    titleTag:        "Claude Skills for AI & LLM — Prompt, RAG, Multi-Agent | SKILON",
    metaDescription: "Claude skills for AI engineers: prompt optimizer, RAG pipeline builder, multi-agent orchestrator, eval harness, fine-tuning prep. Free for the first year.",
    h1:    "Claude Skills for AI & LLM Engineering",
    hero:  "Prompt optimizers, RAG pipeline builders, multi-agent orchestrators, eval harnesses, fine-tuning prep, LLM gateway setups. Built for the AI engineer shipping production LLM features who's tired of LangChain examples that don't survive a load test. Practitioner skills from a team that runs a 13-agent factory in production.",
    body: [
      "Half of AI engineering is glue code. RAG retrieval over a vector store. Prompt versioning + A/B testing. Eval harnesses that catch the regression you'd otherwise notice in user complaints two days later. Multi-agent orchestration with handoff and stop conditions. The patterns are well-known to anyone who's shipped this for 6+ months. They're surprisingly hard to find written down as runnable code rather than blog-post pseudocode.",
      "SKILON's AI & LLM category fixes that. The RAG pipeline builder generates a complete Qdrant + embedding-model + chunking + retrieval-eval scaffold with sane defaults (1k-token chunks, 200-token overlap, BM25 + dense hybrid) and a benchmark harness that scores recall@5 against a golden eval set. The multi-agent orchestrator scaffold ships a typed handoff protocol, deadlock detection, and a JSON event log — patterns we built for our own 13-agent ops stack.",
      "The prompt optimizer takes a prompt + a 20-row eval set and runs an automated rewrite loop scoring each variant against your eval. The eval harness skill produces a pytest-compatible test suite for your LLM-backed function with regression detection on prompt or model changes. The fine-tuning prep skill produces a JSONL dataset from your conversation logs with PII scrubbed and class balance validated.",
      "Pair with Developer Tools (test-generator, code-reviewer) and Data & Analytics (eval-harness reporting). Free for the first year. Sign in to install.",
    ],
    related: ["developer-tools", "data-analytics", "devops-infra"],
  },

  "startup-product": {
    slug:  "startup-product",
    label: "Startup & Product",
    emoji: "🚀",
    color: "#ec4899",
    titleTag:        "Claude Skills for Startup & Product — PRD, Roadmap | SKILON",
    metaDescription: "Claude skills for founders + PMs: PRD writer, RICE roadmap, MVP scope definer, ProductHunt launch strategy, AI product ideator. Free for the first year.",
    h1:    "Claude Skills for Startup & Product",
    hero:  "PRD writers, RICE-scored roadmap builders, MVP scope definers, ProductHunt launch strategy, churn prediction modelers, AI product ideators. Built for founders and product managers who'd rather ship than write spec docs nobody reads. Each skill produces a real artifact (a Notion-ready roadmap, a launch checklist, a PRD MDX) — not a chat summary.",
    body: [
      "The startup work that gets neglected is the writing work. Founders ship features and skip the PRD. PMs run sprints and skip the roadmap update. Marketing happens at the last minute because the launch playbook is in someone's head. Six months in, no one remembers why we shipped X, the roadmap is one PM's mental model, and the launches feel rushed every time.",
      "SKILON's Startup & Product category produces the artifacts that prevent this. The PRD writer takes a problem statement + user goal + constraints and produces a structured PRD with success metrics, user flows, edge cases, and rollout plan — exportable to Notion or Linear. The product roadmap builder takes goals + user feedback + tech debt and runs RICE scoring to produce a prioritized quarterly roadmap.",
      "The MVP scope definer is for the founder asking 'what's the smallest version of this?' — give it your full feature list and it returns a 3-tier cut (must-ship / nice-to-ship / kill) with reasoning. The ProductHunt launch strategy skill produces a complete Day-1 plan: title, tagline, hunter outreach list, hourly engagement schedule, the comment-reply playbook for the first 4 hours that determine ranking.",
      "We use these skills ourselves to run our 6-product, 90-day sprint. Free for the first year. Sign in to install.",
    ],
    related: ["marketing-growth", "ui-ux", "developer-tools"],
  },

  "ui-ux": {
    slug:  "ui-ux",
    label: "UI/UX Design",
    emoji: "🎨",
    color: "#10b981",
    titleTag:        "Claude Skills for UI/UX — Design Tokens, Components | SKILON",
    metaDescription: "Claude skills for designers + frontend engineers: design tokens generator, component library scaffolds, dark mode bridge, accessibility audit. Free for the first year.",
    h1:    "Claude Skills for UI/UX Design",
    hero:  "Design token generators, component library scaffolds, dark-mode bridges, accessibility auditors, landing page copywriters, Tailwind theme builders. Built for the designer-developer hybrid who ships design systems alongside the product. Outputs are real code (Tailwind config, shadcn/ui components, CSS variables) — not Figma-only artefacts.",
    body: [
      "Design systems fail in the handoff. The Figma file has 47 token names; the codebase has 12 hardcoded hex values. The component spec has 8 states; the implementation has 3. Six months in, the design system is a mythical object nobody quite trusts.",
      "SKILON's UI/UX category bridges that gap with code-first artifacts. The design token generator takes a brand spec (primary, accent, semantic colors, type scale, spacing scale) and produces a complete Tailwind config, CSS custom properties block, and shadcn/ui theme JSON — drop it in and the entire codebase respects your tokens. The dark-mode bridge skill audits a Tailwind codebase for color literals and rewrites them to token-driven utilities.",
      "The component library scaffold takes a list of components (button, card, input, modal, drawer, toast) and generates a typed, accessible, theme-aware shadcn/ui-pattern library with proper variants, states, and tests. The accessibility auditor runs WCAG 2.2 AA checks on a deployed URL and returns prioritized findings: contrast ratios that fail, missing labels, focus traps, ARIA misuse — with one-line fixes.",
      "The landing page copywriter takes a product description + ICP + value props and produces hero + feature copy with proper conversion structure. Free for the first year. Sign in to install.",
    ],
    related: ["startup-product", "developer-tools", "marketing-growth"],
  },

  "data-analytics": {
    slug:  "data-analytics",
    label: "Data & Analytics",
    emoji: "📊",
    color: "#3b82f6",
    titleTag:        "Claude Skills for Data & Analytics — SQL, Dashboard | SKILON",
    metaDescription: "Claude skills for data engineers + analysts: SQL query builder, dashboard scaffold, ETL pipeline, A/B test analyzer, churn prediction. Free for the first year.",
    h1:    "Claude Skills for Data & Analytics",
    hero:  "SQL query builders, dashboard scaffolds, ETL pipelines, A/B test analyzers, churn predictors, cohort analysis builders, data quality checkers. Built for the data team that ships not just dashboards but the systems that produce them. Outputs are runnable SQL/Python — not screenshots.",
    body: [
      "Data work has two graveyards: the dashboard nobody opens and the analysis the founder asked for once and never referenced again. The fix isn't more dashboards — it's making the analytics infrastructure produce decisions, not artifacts. That requires good SQL, repeatable analyses, and pipelines that don't break silently.",
      "SKILON's Data & Analytics category is the production playbook for that. The SQL query builder takes a plain-English question and returns optimized SQL across PostgreSQL, BigQuery, Snowflake, ClickHouse — with proper joins, CTEs, window functions, and runtime annotations. The dashboard scaffold builds a Metabase/Redash/Looker config from a spec that includes drill-down paths, segment filters, and alert thresholds.",
      "The A/B test analyzer takes raw event data and produces a properly-controlled analysis: power calculation, sequential testing correction, confidence intervals, and the call ('ship', 'kill', 'inconclusive — extend by N days'). The churn prediction model trains a survival model on user activity logs, returns a per-user churn probability, and produces a feature-importance breakdown so the team knows which behaviors to influence.",
      "Pair with AI & LLM (eval harness) and Trading & Finance (backtesting). Free for the first year. Sign in to install.",
    ],
    related: ["ai-llm", "trading-finance", "developer-tools"],
  },

  "devops-infra": {
    slug:  "devops-infra",
    label: "DevOps & Infra",
    emoji: "🛠",
    color: "#6366f1",
    titleTag:        "Claude Skills for DevOps & Infra — CI/CD, K8s | SKILON",
    metaDescription: "Claude skills for SREs + platform engineers: GitHub Actions CI, Kubernetes manifests, Terraform IaC, observability setup, incident runbooks. Free for the first year.",
    h1:    "Claude Skills for DevOps & Infra",
    hero:  "GitHub Actions CI scaffolds, Kubernetes manifests, Terraform modules, observability stacks (Sentry + Axiom + PostHog), incident runbooks, secret rotation flows. Built for the platform engineer who'd rather ship infra-as-code than maintain a bespoke YAML zoo. Every skill produces a complete, runnable artifact.",
    body: [
      "DevOps is repetitive by design. Every new service needs a Dockerfile, a deploy pipeline, an alerting policy, an SLO dashboard, a runbook. The first time you set this up it takes two weeks. The fifteenth time, it should take 20 minutes. The reason it doesn't is because each project starts from scratch and 'we'll standardize next quarter' never arrives.",
      "SKILON's DevOps & Infra category is the standardization. The GitHub Actions CI scaffold takes a stack description (Next.js, FastAPI, Go, Rust, etc.) and produces a complete workflow: lint, type-check, test, build, deploy, notify. The Kubernetes manifest skill takes a service spec and produces deployment + service + ingress + HPA + PDB + network policy YAML, with sane resource limits.",
      "The observability setup skill wires Sentry (errors), Axiom (logs), and PostHog (product analytics) into a Next.js or Python codebase with proper sampling rates, PII scrubbing, and alert routing. The incident runbook skill takes a service architecture and produces a markdown runbook covering top-5 failure modes with diagnostic commands, mitigation steps, and escalation paths.",
      "The secret rotation flow skill produces a complete rotation pipeline (KMS or Vault → Vercel/AWS env → app reload) with health-check guards. We learned the importance of this one the hard way during a real incident. Free for the first year. Sign in to install.",
    ],
    related: ["developer-tools", "ai-llm", "communication-protocols"],
  },

  "communication-protocols": {
    slug:  "communication-protocols",
    label: "Protocols",
    emoji: "🔗",
    color: "#14b8a6",
    titleTag:        "Claude Skills for Communication Protocols — MQTT, gRPC | SKILON",
    metaDescription: "Claude skills for protocol engineers: MQTT, gRPC, WebSocket, CoAP, Modbus, OPC-UA setups. Production-ready. Free for the first year.",
    h1:    "Claude Skills for Communication Protocols",
    hero:  "MQTT broker setups, gRPC service scaffolds, WebSocket servers, CoAP IoT integrations, Modbus RTU bridges, OPC-UA gateways. Built for the engineer connecting two systems that weren't designed to talk to each other. Every skill produces complete, runnable code with TLS, auth, and reconnection logic baked in.",
    body: [
      "Protocol work is where most integration projects go wrong. The vendor's MQTT broker uses ACLs the docs don't fully describe. The gRPC service handles streaming differently in Go vs Python clients. The Modbus device returns big-endian floats in some registers and little-endian in others, with no consistency across firmware versions. None of this is hard once you know it; all of it is invisible until production.",
      "SKILON's Protocols category captures the production-validated patterns. The MQTT broker setup skill produces a Mosquitto or EMQX config with TLS termination, JWT or x.509 auth, ACL-driven topic permissions, and persistence — ready to deploy on Fly.io, Railway, or your own VPS. The gRPC service scaffold generates the proto definition, server stub, client stub, plus an integration test using bufconn.",
      "The WebSocket server scaffold produces a connection-manager with heartbeat, reconnection backoff, room/channel pub-sub, and rate limiting. The CoAP IoT bridge generates an aiocoap server in Python with observable resources for sensor telemetry. The Modbus RTU bridge produces a pymodbus-based gateway that publishes register reads to MQTT with configurable scale and endianness.",
      "Pair with IoT & Hardware (firmware that talks these protocols) and DevOps & Infra (deploying the brokers). Free for the first year. Sign in to install.",
    ],
    related: ["iot", "devops-infra", "developer-tools"],
  },

  "marketing-growth": {
    slug:  "marketing-growth",
    label: "Marketing & Growth",
    emoji: "📈",
    color: "#f43f5e",
    titleTag:        "Claude Skills for Marketing & Growth — SEO, Email | SKILON",
    metaDescription: "Claude skills for marketers + growth: SEO content writer, email sequence builder, landing page copywriter, paid ad creative. Free for the first year.",
    h1:    "Claude Skills for Marketing & Growth",
    hero:  "SEO content writers, email sequence builders, landing page copywriters, paid ad creative generators, referral program designers, ProductHunt launch playbooks. Built for the marketer who runs growth in-house at a startup and wears 5 hats. Every skill produces real campaign-ready output (HTML email, ad copy variants, blog post MDX) — not strategy decks.",
    body: [
      "Most growth advice is generic. 'Focus on retention.' 'Add social proof.' 'A/B test your headlines.' True, useless. The work is in the execution: writing the email sequence that lands, drafting the 8 ad variants for Meta, building the referral mechanic that doesn't get gamed, scoping the SEO content calendar that ranks within 6 months.",
      "SKILON's Marketing & Growth category is the execution playbook. The SEO content writer takes a target keyword + competitor URLs + your differentiator and produces a 1500-word blog post with proper H-tag structure, internal linking suggestions, and SERP-ready meta tags. The email sequence builder takes an ICP + offer + funnel stage and produces a 5-email sequence with subject A/B variants and send timing.",
      "The landing page copywriter produces hero + feature copy + objection-handling FAQ structured around a chosen conversion model (problem-agitate-solve, benefit-led, social proof-first). The paid ad creative skill generates 8 variants for Meta/LinkedIn/X with different angles (pain, aspiration, social proof, urgency, novelty) plus image-prompt suggestions for Midjourney.",
      "The referral program design skill specifies a referral mechanic that's hard to game (verified install + first-action gate vs. just signup), with attribution flow and email/in-app nudge sequences. We use these skills to run our own SKILON growth. Free for the first year. Sign in to install.",
    ],
    related: ["startup-product", "ui-ux", "data-analytics"],
  },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_CONTENT);
