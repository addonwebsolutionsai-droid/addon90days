# Problem Discovery Playbook

How `@problem-scout` actually runs deep problem discovery. Referenced from the agent prompt.

## Why this matters

Most "product ideas" fail because they're solutions looking for problems. Our antidote: **every product bet starts with documented evidence of real, painful, valuable unmet problems** from actual prospects.

## The four signals that matter

A problem worth solving has ALL FOUR:

1. **Frequency** — same complaint appears across many independent sources
2. **Intensity** — people are emotionally charged about it (anger, frustration, resignation)
3. **Willingness to pay** — they're already paying for a bad solution or asking where to pay for a good one
4. **Discoverability** — you can reach these people cost-effectively (not buried in a walled community you can't access)

If a problem has only 2 of 4, document it but don't prioritize it.

## Scanning methodology (detail)

### Phase 1: Keyword sweep (per vertical, 60-90 min)

Run 10-15 targeted queries per source. Examples (builder/construction vertical):

**Reddit queries:**
- site:reddit.com "I hate procore because"
- site:reddit.com "construction software sucks"
- site:reddit.com "tracking site expenses" -hire -jobs
- site:reddit.com "subcontractor payments" annoying OR problem
- site:reddit.com "construction accounting" nightmare OR headache
- r/Construction + r/ContractorUK + r/BuildingScience + r/civilengineering

**HN / IndieHackers:**
- "ask HN construction software"
- "show HN" construction OR builder
- IndieHackers: posts tagged "construction" or "real-estate"

**Twitter/X:**
- "quickbooks for construction" annoying OR terrible OR replace
- "wish there was an app" construction OR builder OR "site management"
- "{competitor name}" + "wish" or "should" or "doesn't"

**Review sites:**
- G2: [incumbent product] 1-2 star reviews (filter by rating)
- Capterra: same filter
- TrustPilot: same

**Jobs/gigs sites:**
- Upwork: "construction site tracking" posted N times in last 30 days
- Fiverr: same

### Phase 2: Thread mining (for top 20 hits, ~90 min)

For each high-signal result, read the full thread — not just the headline. Look for:

- **Root cause, not symptom** — "Procore is slow" is a symptom; "site engineers on site can't use web-based tools with gloves on" is a root cause
- **Money language** — references to cost, waste, revenue, margin, savings
- **Time language** — "spends 4 hours a week on..." gives a quantifiable pain
- **Workaround descriptions** — "we use a spreadsheet + WhatsApp group" = current solution to displace
- **Emotional markers** — "drives me crazy", "wasted money", "lost trust"

Save raw quotes with source URLs. Quotes beat paraphrase 100% of the time.

### Phase 3: Pattern clustering (30-45 min)

Group the raw quotes into 3-7 themes. Don't force it — let themes emerge from the data.

A good cluster has:
- 5+ independent sources saying the same thing
- Variance in expression (not copy-paste viral complaint)
- Different personas (not just one angry user in 5 subreddits)

### Phase 4: Signal strength scoring

For each cluster, score 1-5 on each signal:

| Signal | 1 | 3 | 5 |
|---|---|---|---|
| Frequency | One thread | 5-10 independent mentions | 20+ mentions across platforms |
| Intensity | Mild annoyance | Clear frustration | People are furious / switching products |
| WTP | No money mentioned | Users paying for bad solution | Explicit "I'd pay $X for this" or active Upwork postings |
| Discoverability | Hidden community | Accessible online | High-traffic public channels |

Composite score out of 20. Problems scoring 15+ are worth validating.

### Phase 5: Competitive gap analysis (45-60 min)

For each high-signal cluster, identify:
- **Who's trying to solve this today?** (list 5-10 tools/services)
- **Where do they fall short?** (the gap our product could fill)
- **What's their pricing?** (baselines your own)
- **What's their go-to-market?** (so we know what channels they've proven out)

## Template for a good problem statement

Bad: "Builders want better software."

Good: "Owners of 5-50 employee construction firms in Tier-2 Indian cities are losing 5-12% of site costs to manual tracking via WhatsApp and Excel, and existing tools (Procore, Buildertrend) are priced for US enterprise while local solutions are desktop-era and ignore mobile-first workflows for site engineers who work with gloves on."

Elements that make it good:
- Specific who (size, geography)
- Specific pain (quantified: 5-12%)
- Specific current workaround (WhatsApp + Excel)
- Specific competitive gap (Procore too expensive, local too desktop-centric)
- Specific context (mobile-first, gloves)

## When to escalate to new-product-bet

A problem discovered in scanning is a **potential new product bet** when:

- Composite score ≥ 18
- Doesn't overlap significantly with our 7 existing PRDs
- We have some plausible differentiator (our IoT/firmware skills, Indian market access, Claude ecosystem chops, etc.)
- The market is big enough to support a $1M+ ARR product within 18 months

When you find one of these, flag to `@cmo` + add to approval queue as "potential new product bet — recommend `/validate-idea` spend."

## When to kill a problem (don't keep trying to validate)

- Even after aggressive search, frequency is low
- Intensity signals are mild ("annoying" vs "making me fire my vendor")
- No WTP evidence at all
- The problem is deeply regulated and we lack expertise
- Existing products score 4.5+ on G2/Capterra — market is satisfied

Kill cleanly. Don't keep digging for signal that isn't there.

## Output quality bar

A good problem radar report:
- Has direct quotes from multiple independent sources
- Identifies at least 2 problems NOT already on our radar
- Scores each problem on all 4 signals
- Proposes next-step action (validate, watch, kill)
- Links to raw evidence (not paraphrases)

A bad report (reject):
- Generic "users want X"
- Paraphrase where direct quote exists
- Rates everything as "high signal"
- No next-step proposals
- Pulled from one source only

## Quarterly refresh

Every 90 days, re-scan all active product verticals. Markets shift. Competitors ship. New pain emerges. A fresh radar doc every quarter keeps strategy from going stale.
