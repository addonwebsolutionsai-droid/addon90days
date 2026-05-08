/**
 * Curated trend-prompt seeds for autonomous Skill Smith runs.
 *
 * Why this exists: when the cloud routine fires without a specific trend, it
 * needs SOMETHING to feed Skill Smith. Previously the routine called
 * problem-radar which returned the same H2 each time → Skill Smith generated
 * dupes → quality gate rejected → 0 skills shipped. This list is wide,
 * concrete, and biased toward AddonWeb's moat categories (IoT, Indian
 * business, trading) so a random pull always produces something useful.
 *
 * Seeds are written like real founder pain — specific actor, specific
 * outcome, specific friction. That diction primes the model to produce
 * specific drafts (high score) instead of generic Claude-already-does-this
 * fluff (rejected).
 *
 * To add a seed: pick the rarest matching category, write 3-5 sentences in
 * the same voice, append. Don't go below 3 seeds in any category — the
 * autonomous picker filters by category and a thin pool produces dupes.
 */

import type { SkillCategory } from "./database.types";

export interface SkillSeed {
  category: SkillCategory;
  /** Plain-English problem statement, 3-5 sentences. */
  prompt:   string;
}

export const SKILL_SEEDS: readonly SkillSeed[] = [
  // ------------------------------------------------------------------- IoT
  {
    category: "iot",
    prompt:
      "An ESP32 firmware developer wants to debug why their device disconnects from MQTT every ~10 minutes. They need a skill that produces a diagnostic checklist — TCP keepalive intervals, broker QoS, watchdog config, network credentials caching — plus a minimal C/C++ snippet showing how to enable robust reconnect with exponential backoff. Output is a copy-paste C++ block plus a 6-step checklist of broker-side and device-side things to check.",
  },
  {
    category: "iot",
    prompt:
      "An IoT firmware engineer wants to add OTA (over-the-air) firmware updates to their ESP32-based product without bricking devices. They need a skill that scaffolds the OTA endpoint server (Node.js + signed firmware blobs), the device-side update logic with rollback on boot-loop, and a release manifest format. Output is the server route, the firmware C++ update task, and a release checklist.",
  },
  {
    category: "iot",
    prompt:
      "A solo hardware founder shipping a battery-powered LoRa sensor wants to extend battery life from 30 days to 6 months. They need a skill that produces a power-budget audit: deep sleep config, peripheral wake gating, transmit duty cycle, sensor sampling cadence. Output is a power-budget table (mA × hours per state) plus the firmware sleep-mode setup snippet.",
  },
  {
    category: "iot",
    prompt:
      "An MQTT broker operator wants to capacity-plan a deployment going from 1k → 100k connected devices. They need a skill that recommends broker choice (Mosquitto vs EMQX vs HiveMQ), a tuned config snippet for the chosen broker, sysctl tweaks (file descriptors, TCP buffers), and a load-test script using mqtt-stresser. Output is a deployment-decision doc plus the tuned config files.",
  },
  {
    category: "iot",
    prompt:
      "A factory automation engineer wants to bridge legacy Modbus-RTU PLCs to MQTT so a cloud dashboard can read tag values. They need a skill that produces a Modbus-to-MQTT gateway config (Node-RED or Python) — register-to-topic mapping table, polling cadence, error handling, on-disconnect cache flush. Output is the config file plus a topic-naming convention guide.",
  },
  {
    category: "iot",
    prompt:
      "An Industry 4.0 integrator wants to add condition monitoring to a CNC machine using a vibration sensor. They need a skill that scaffolds the data pipeline: sensor sampling at 1kHz on ESP32, FFT on-device, threshold alerting, and a TimescaleDB schema for the rolling history. Output is firmware code + DB schema + a Grafana dashboard JSON.",
  },

  // -------------------------------------------------------- INDIAN BUSINESS
  {
    category: "indian-business",
    prompt:
      "A small-business CA in India wants to automate GSTR-1 filing reconciliation. They need a skill that takes a sales register CSV, matches it against GSTN portal-downloaded data, flags mismatches (HSN, place of supply, tax rate), and produces a fix-list grouped by invoice. Output is the reconciliation report (CSV) plus a remediation steps doc per mismatch type.",
  },
  {
    category: "indian-business",
    prompt:
      "An e-commerce seller on Amazon India and Flipkart wants automated TDS-on-payments tracking under Section 194-O. They need a skill that ingests marketplace settlement reports, computes platform-deducted TDS per order, reconciles against Form 26AS, and outputs a quarter-end advance-tax estimate. Output is a CSV breakdown and a draft challan.",
  },
  {
    category: "indian-business",
    prompt:
      "A founder of a private limited company in India needs to draft annual ROC compliance forms (DIR-3 KYC, DPT-3, MGT-7A). They need a skill that, given the company's MCA portal data and FY balance sheet, produces draft filings with the correct field-by-field values, plus a deadline calendar. Output is the form drafts (PDF/JSON) plus a compliance calendar.",
  },
  {
    category: "indian-business",
    prompt:
      "A D2C founder wants to handle an India-side customer GST invoice request after the order has already shipped without an invoice. They need a skill that generates a compliant retroactive tax invoice (HSN, GSTIN, place-of-supply, reverse-charge if applicable) from minimal inputs (order ID, customer GSTIN, line items). Output is a print-ready PDF + JSON for ERP upload.",
  },
  {
    category: "indian-business",
    prompt:
      "A SaaS founder selling to Indian customers wants to set up Razorpay subscriptions correctly with GST. They need a skill that scaffolds the Razorpay integration, handles plan creation with intra/inter-state tax logic, generates the recurring invoice template with GSTIN, and explains the e-invoicing IRN flow when turnover crosses ₹5cr. Output is the Node.js integration code + invoice template + a tax-config matrix.",
  },

  // ------------------------------------------------------- TRADING-FINANCE
  {
    category: "trading-finance",
    prompt:
      "An options trader on NSE wants to build a daily 0DTE Bank Nifty straddle screener. They need a skill that ingests yesterday's spot, computes ATM strike, fetches current premium for the straddle, computes break-evens, and outputs an actionable trade card if implied volatility ranks > 60. Output is the trade card with entry/exit/stop-loss.",
  },
  {
    category: "trading-finance",
    prompt:
      "A swing trader wants a daily pre-market briefing on US-listed stocks they hold. They need a skill that pulls overnight news per ticker, summarizes it in 2 sentences each, flags any catalyst (earnings, FDA, M&A), and computes the pre-market gap %. Output is a markdown briefing with red/yellow/green status per holding.",
  },
  {
    category: "trading-finance",
    prompt:
      "A crypto trader running a delta-neutral perp/spot arb wants to monitor funding-rate divergence across Binance, Bybit, OKX. They need a skill that fetches funding rates, computes the cross-exchange spread, sizes a position to capture > 0.05%/8h, and outputs the trade ticket (size, leverage, exchange-pair). Output is the trade ticket plus a P&L estimate.",
  },
  {
    category: "trading-finance",
    prompt:
      "A small-cap equity analyst wants to systematize finding mispriced microcap stocks on NSE. They need a skill that filters NSE smallcap universe by EV/EBITDA, FCF yield, debt-to-equity, then reads the latest annual report's MD&A and outputs a 3-paragraph thesis + 3 risk factors. Output is a thesis card per shortlisted stock.",
  },
  {
    category: "trading-finance",
    prompt:
      "A retail trader using TradingView wants to convert a Pine Script strategy into a Python backtester with proper survivor-bias-free data. They need a skill that takes the Pine code, generates equivalent Python (pandas + vectorbt), wires in yfinance/Polygon for OHLCV, and outputs walk-forward performance stats. Output is the Python file + a stats summary report.",
  },

  // ----------------------------------------------------------- DEVELOPER TOOLS
  {
    category: "developer-tools",
    prompt:
      "A developer joining an unfamiliar TypeScript monorepo wants a 'first-day onboarding' skill. They need a skill that crawls the repo, identifies the entry points, maps the module graph, lists the top 10 files by churn (git log), and produces a 'where things live' README aimed at the new contributor. Output is a markdown onboarding doc.",
  },
  {
    category: "developer-tools",
    prompt:
      "A Rust developer wants to migrate a CPU-bound Python service to Rust without rewriting it all at once. They need a skill that identifies the hot path (profiling output), generates the Rust crate scaffold with PyO3 bindings, ports the function with idiomatic Rust, and produces a side-by-side benchmark harness. Output is the Cargo.toml + Rust source + a measurement script.",
  },
  {
    category: "developer-tools",
    prompt:
      "A maintainer of a popular open-source library wants to triage 50+ open issues into 'good first issue', 'help wanted', 'duplicates', 'won't fix'. They need a skill that takes the issue list (JSON) and outputs a labeled list with one-sentence reasoning per issue, plus a draft response template per category. Output is the labeled issue table + reply templates.",
  },
  {
    category: "developer-tools",
    prompt:
      "A backend engineer wants a skill that converts a Postman collection into a fully-typed TypeScript SDK. They need it to read the Postman JSON, infer types from example responses, produce a class with one method per request, and add input/output Zod validators. Output is a generated `client.ts` with no runtime deps beyond fetch + Zod.",
  },

  // ----------------------------------------------------------- STARTUP PRODUCT
  {
    category: "startup-product",
    prompt:
      "A solo founder preparing for YC interview wants a skill that audits their application for the standard YC weak-spots: vague TAM, no clear ICP, fluffy traction, missing why-now. They need a skill that takes the application text and outputs a redline (problems flagged inline) + 3 bullet points per weakness with a rewritten paragraph. Output is the marked-up application.",
  },
  {
    category: "startup-product",
    prompt:
      "A B2B SaaS founder wants to systematize churn-cause discovery from cancellation interviews. They need a skill that takes 5-10 customer cancellation transcripts, codes them against a taxonomy (price, missing-feature, switched-to-competitor, no-longer-need), produces a Pareto chart-friendly summary, and outputs 3 product priorities to test. Output is the analysis doc + a priority list.",
  },
  {
    category: "startup-product",
    prompt:
      "A first-time founder writing their seed round pitch deck wants a skill that audits the deck for the 12 standard slides (problem, solution, market, etc.). They need it to take screenshots or text per slide and produce a critique per slide + a rewritten one-line summary. Output is a deck-review doc with red/yellow/green per slide.",
  },
  {
    category: "startup-product",
    prompt:
      "A product manager planning their first PRD wants a skill that converts a one-line feature idea into a full PRD: problem statement, user stories, acceptance criteria, edge cases, metrics, design references. They need it to ask clarifying questions before writing if the idea is too vague. Output is the structured PRD markdown.",
  },

  // -------------------------------------------------------------- AI / LLM
  {
    category: "ai-llm",
    prompt:
      "A founder building a customer-facing RAG chatbot wants to evaluate retrieval quality before shipping. They need a skill that takes a sample of 20-50 'gold' QA pairs, runs them against the live RAG, computes retrieval precision/recall/MRR, and outputs a labeled error analysis (chunk-too-small, embedding-mismatch, prompt-fail). Output is an evaluation report markdown.",
  },
  {
    category: "ai-llm",
    prompt:
      "A platform team wants to ship a 'meta-prompt optimizer' — a skill that takes a working but verbose prompt and produces a shorter, equivalent version with the same downstream behavior. They need it to run an A/B comparison on 10 sample inputs and verify outputs match within tolerance. Output is the optimized prompt + a diff table.",
  },
  {
    category: "ai-llm",
    prompt:
      "A founder running a cost-sensitive Claude integration wants to route prompts between Haiku (cheap), Sonnet (mid), and Opus (premium) based on input complexity. They need a skill that scaffolds the routing logic — token-count + heuristics + a small classifier — with a fallback ladder if the cheaper model returns a confidence < threshold. Output is TypeScript router code + a benchmark.",
  },
  {
    category: "ai-llm",
    prompt:
      "An LLM engineer wants to detect prompt-injection attempts in user input before passing it to an agent. They need a skill that scaffolds a defense-in-depth check: regex patterns for known jailbreak strings, a small classifier prompt, output sanitization, and per-user rate limiting. Output is the defense module code + a test corpus.",
  },

  // ----------------------------------------------------------------- UI/UX
  {
    category: "ui-ux",
    prompt:
      "A solo developer building a dashboard wants a skill that audits a screenshot of their UI and outputs a prioritized fix list — alignment, hierarchy, colour contrast (WCAG), spacing rhythm, font scale. They need actionable fixes with the exact Tailwind classes to change. Output is a fix list grouped by severity.",
  },
  {
    category: "ui-ux",
    prompt:
      "A founder wants to convert a Figma mockup screenshot into shadcn/ui + Tailwind React component code. They need a skill that takes the screenshot, identifies primitives (button, card, input, badge), maps them to shadcn components, and produces clean JSX with semantic Tailwind classes. Output is a self-contained .tsx file.",
  },
  {
    category: "ui-ux",
    prompt:
      "A SaaS team wants to systematize empty-state design across their app. They need a skill that, given the screen name and what data is missing, produces an empty-state card spec: hero illustration brief, primary CTA, secondary action, supporting copy. Output is the design spec + the React component scaffold.",
  },
  {
    category: "ui-ux",
    prompt:
      "An indie developer launching their first product wants a skill that designs a high-converting pricing page. They need a skill that takes the product positioning + 2-3 plan tiers and produces full pricing-page React code: feature comparison table, plan-card highlighting, FAQ accordion, social proof slot. Output is the .tsx file with Tailwind classes.",
  },

  // ----------------------------------------------------------- DATA-ANALYTICS
  {
    category: "data-analytics",
    prompt:
      "An analyst wants a skill that converts a Notion-style natural-language question ('what's our weekly active users last month vs prior month') into a working SQL query against a known schema. They need it to ask for missing schema details if the question can't be unambiguously translated. Output is the parametrized SQL + a one-line interpretation note.",
  },
  {
    category: "data-analytics",
    prompt:
      "A data engineer wants to convert hand-written Pandas EDA notebooks into reusable dbt models. They need a skill that takes a notebook, identifies the source tables, the transforms applied, and the final output, then produces a dbt model file (with config, ref(), and tests). Output is the .sql model + a schema.yml entry.",
  },
  {
    category: "data-analytics",
    prompt:
      "A growth analyst wants a daily anomaly-detection skill on top of their core metrics (signups, activations, revenue). They need it to fetch the last 90 days of daily counts, fit a simple seasonal-adjusted baseline, flag any day > 2σ from baseline, and produce a Slack-ready summary. Output is the alert-message + a chart spec.",
  },

  // ----------------------------------------------------------------- DEVOPS
  {
    category: "devops-infra",
    prompt:
      "An SRE wants a skill that converts a 'service is slow' bug report into a structured runbook investigation: list the 5 most likely root causes, the exact dashboard/log query to check each, and the 'mitigation if confirmed' action. Output is a markdown runbook tailored to that specific service.",
  },
  {
    category: "devops-infra",
    prompt:
      "A founder running a Postgres on RDS wants a skill that audits their database for the top 5 quick-win optimizations: missing indexes (from pg_stat_statements), bloat in top tables, vacuum config, connection-pooling layer, statement_timeout. Output is a prioritized fix list with the exact SQL commands.",
  },
  {
    category: "devops-infra",
    prompt:
      "A platform engineer wants a skill that converts a docker-compose.yml file into a production-ready Kubernetes deployment: separate Deployments + Services + Ingress per service, ConfigMap for env, persistent volumes for stateful services, and a sensible resources/limits block. Output is the k8s YAML bundle.",
  },

  // -------------------------------------------------------- COMMS / PROTOCOLS
  {
    category: "communication-protocols",
    prompt:
      "A backend developer wants to add real-time multiplayer cursors to their app. They need a skill that picks the right protocol (WebSocket vs SSE vs WebRTC datachannel), scaffolds the server-side broadcast (Node.js), and writes a tiny client hook (React). Output is the server.ts + useCursors.ts + a connection-state diagram in markdown.",
  },
  {
    category: "communication-protocols",
    prompt:
      "A team migrating from REST to GraphQL wants a skill that audits an existing OpenAPI spec and proposes the equivalent GraphQL schema: types, queries, mutations, with notes on N+1 risks per resolver. Output is the .graphql schema + a resolver-design doc.",
  },
  {
    category: "communication-protocols",
    prompt:
      "A developer adding webhooks to their SaaS wants a skill that produces a production-quality webhook system: HMAC signature scheme, retry-with-backoff, per-customer secrets table schema, idempotency-key handling, and a debugger UI for the customer. Output is the Node.js sender code + DB schema + the customer-facing debugger spec.",
  },

  // ----------------------------------------------------------- MARKETING-GROWTH
  {
    category: "marketing-growth",
    prompt:
      "A B2B SaaS founder wants to systematize their cold-email outbound. They need a skill that takes an ICP description and one anchor case study, then generates a 4-step sequence: opener, social-proof drop, soft-CTA, breakup email — each under 90 words, no fluff. Output is the 4 email bodies + subject lines.",
  },
  {
    category: "marketing-growth",
    prompt:
      "An indie hacker launching on Product Hunt wants a skill that drafts the full launch kit: PH listing copy, tagline, gallery captions, first comment, day-of tweet thread, hourly check-in plan. They need it to take the product URL + positioning as input. Output is the full launch kit in one markdown.",
  },
  {
    category: "marketing-growth",
    prompt:
      "A founder doing SEO for the first time wants a skill that produces a programmatic-SEO page bundle for a long-tail keyword cluster (e.g. 'X tool for Y use case'). They need it to identify 30 long-tail variants, draft a unique 800-word page template per variant slot, and include a JSON-LD schema block. Output is the keyword sheet + a page template + the JSON-LD.",
  },
];

/** Pull all categories that appear at least once in the seed list. */
export function seedCategories(): readonly SkillCategory[] {
  const set = new Set<SkillCategory>();
  for (const s of SKILL_SEEDS) set.add(s.category);
  return Array.from(set);
}

/**
 * Pick one seed at random, biased toward the categories supplied in
 * `underrepresented`. The bias is 70/30 — 70% of picks come from the
 * underrepresented set, 30% from the full pool, so we keep the catalog
 * balanced without starving the well-covered categories of fresh skills.
 */
export function pickSeed(underrepresented: readonly SkillCategory[] = []): SkillSeed {
  const useBias = underrepresented.length > 0 && Math.random() < 0.7;
  const pool: readonly SkillSeed[] = useBias
    ? SKILL_SEEDS.filter((s) => underrepresented.includes(s.category))
    : SKILL_SEEDS;
  const fallback = pool.length > 0 ? pool : SKILL_SEEDS;
  const idx = Math.floor(Math.random() * fallback.length);
  return fallback[idx]!;
}
