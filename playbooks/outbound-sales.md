# Outbound Sales Playbook

How `@outbound-sales` runs the cold motion. Personalization + volume + discipline.

## The rules of the game

**Three non-negotiables:**
1. Never send without a real, specific reason why THIS prospect — no "I saw you work at {company}" openers.
2. Never send from the main addonwebsolutions.com domain. Always a dedicated outbound domain (domain reputation is everything).
3. Never skip the deliverability setup. SPF/DKIM/DMARC/warmup = 21 days minimum before any volume.

Break any of these and you burn the domain's reputation AND get nothing in return.

## Infrastructure setup (one-time, before any cold volume)

### Domain(s)
- Buy 2-3 lookalike domains: `tryaddonweb.com`, `addonweb-outreach.com`, `getchatbase.com` (product-specific for high-volume cohorts)
- Each domain = its own sending identity
- Never send from the main brand domain — protects inbound deliverability

### DNS
- SPF record: authorize your sending platform (Instantly, etc.)
- DKIM: set up per-domain
- DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc@your-domain.com;`
- Verify all three pass via mail-tester.com before any volume

### Inboxes
- 3-5 inboxes per domain for rotation (e.g., `founder@`, `sales@`, `hello@`, `alex@`, `priya@`)
- Daily cap per inbox: 50 emails max
- Combined per domain: 150-250/day
- Total across infra: 500-1000/day at full scale

### Warm-up
- 21-day automated warm-up through Instantly or similar
- Warmup emails engage naturally (open, reply, star, archive)
- Never start cold volume before warmup complete

### Health monitoring
- Daily: bounce rate (must stay <2%)
- Daily: spam complaint rate (<0.1%)
- Weekly: inbox placement test (via mail-tester or Glockapps)
- If any metric degrades: pause cohort, investigate

## Cohort planning

Every outbound push is a **cohort** — named, scoped, measurable.

Naming: `{product}-{vertical}-{month}`. Example: `chatbase-smbindia-may26`.

### Cohort doc template

`operations/outbound-cohorts/{name}.md`:

```markdown
# Cohort: {name}

## Product
{product}

## ICP
- Roles: {specific titles}
- Seniority: {level}
- Company size: {employees or revenue}
- Industry: {specific verticals, NAICS if helpful}
- Geography: {country, region, city if hyperlocal}
- Tech signals: {uses Shopify, uses Tally, uses AWS, etc.}
- Growth signals: {funding, hiring, recent news}

## Trigger / Why now
Why are these prospects likely to care THIS month?

## List source
- Apollo filters: {specific}
- Target count: {usually 100-300 for first batch}
- Enrichment: {name, email, title, company, LinkedIn URL, 1-line personalization hook}

## Offer
- Product being sold
- Specific CTA: reply / book 15 min / watch 2-min video
- Price being anchored (if any)

## Sequence
See below for the standard 4-email + LinkedIn pattern.

## Success metrics
- Reply rate target: >8% (>15% is great)
- Positive reply rate: >3%
- Meeting booking rate: >2%

## Kill criteria
- Bounce rate >3% at any point
- Spam complaint >0.5% at any point
- Reply rate <3% after 50% of cohort sent
```

## The sequence (4 email + LinkedIn twin track)

### Email 1 (Day 0) — The hook

Goal: get a reply. Not a calendar booking, not a website visit. A reply.

Format: 40-75 words. No signature picture. No giant email footer.

Example (ChatBase cohort):

```
Subject: WhatsApp customer chaos at {CompanyName}?

{First name},

Noticed {CompanyName} has been growing — congrats on the recent expansion.

How are you handling customer messages across WhatsApp right now? 
Multiple phones + manual replies is what most 20-100 person businesses 
tell me — and it's where customer response times quietly kill retention.

We built ChatBase — a WhatsApp AI suite that automates replies, broadcasts 
to customer segments, and gives your team one shared inbox.

Worth a quick reply?

{Founder name}
```

### Email 2 (Day 3) — Different angle

Goal: re-engage the 92% who didn't reply. Different hook, not just a "bump".

Example:

```
Subject: re: WhatsApp customer chaos

{First name},

Quick follow-up. I mentioned auto-replies — here's the part that 
surprised our beta users most:

They were losing orders they didn't know about. Messages came in 
after hours, nobody replied, customer went to a competitor. When we 
turned on ChatBase auto-replies, one pilot user recovered 3 lost 
orders in the first week.

Worth a look at the auto-reply analytics view?

{Founder name}
```

### Email 3 (Day 7) — Social proof

Goal: add credibility. Reference a similar customer (real or composite — never lie about specifics).

Example:

```
Subject: re: WhatsApp customer chaos

{First name},

One more note and I'll leave you alone.

Spoke with a retail business owner in Ahmedabad last week. They're 
running ChatBase across 2 locations and replied: "Cut our response 
time from 4 hours to under 2 minutes — customers notice."

That's a specific outcome. Not a marketing promise.

If this is interesting, hit reply.

{Founder name}
```

### Email 4 (Day 12) — Breakup

Goal: signal respect. Often pulls replies from people who forgot.

Example:

```
Subject: closing this loop

{First name},

I've emailed three times, you're clearly busy. I'll stop.

If six months from now you're still juggling customer WhatsApp messages 
manually, my inbox is open.

{Founder name}
```

### LinkedIn twin track

- **Day 0:** Connection request with a short note. Reference something specific. No pitch. 300 char max.
- **Day 7 (after accept):** Share a piece of content relevant to them (THEIR post, not ours — genuine engagement).
- **Day 14 (if still nothing):** Short DM pitching, with one clear ask.

## Response handling

### Positive reply
- Within 1 hour: `@inbound-sales` takes over
- Book calendar link
- Pre-call prep: research prospect, prep questions, prep demo if enterprise

### Negative reply ("not interested", "not a fit", etc.)
- Acknowledge politely, never argue
- Add to suppression list (never re-contact same domain)
- Move on

### Out-of-office / wrong person
- Update CRM with correct contact if possible
- Re-route through their colleague if relevant

### Hostile reply
- Log, suppress entire domain, do NOT engage
- If suggesting a legal issue, escalate to founder

## Enterprise motion (different sequence)

For ConnectOne (P05) + MachineGuard (P06) IoT × AI enterprise prospects — our moat play — use a different cadence:

1. **Heavy research per prospect** (30-60 min each). Their stack, their public roadmap, what devices they've deployed. Note public LinkedIn posts from their engineering team.
2. **Video message first** (Loom/Vidyard, 90 seconds). Founder-recorded. Show you understand their world. Don't just describe us — describe THEIR challenge and your specific idea for them.
3. **Email linking to video** with personal note:
   ```
   {First name},
   
   Spent 20 minutes looking at {specific public thing about their company}. 
   Rather than write a long email, I recorded a quick video with one idea:
   
   {Loom link}
   
   If this resonates, would love 15 min.
   
   {Founder name}
   ```
4. **If no reply in 10 days:** send a case study email with a similar company (anonymized if needed), specifically the problem they face → what we did → outcome. No pitch.
5. **If still nothing:** one final check-in at 30 days, then archive.

These take 5x the time per prospect. You do 10-20/week, not 100/week. But each is worth $50K+ if it closes.

## Weekly metrics to track

| Metric | Target | Kill/Fix threshold |
|---|---|---|
| Emails sent/week | 500 | — |
| Bounce rate | <2% | >3% = pause cohort |
| Spam complaint | <0.1% | >0.5% = pause domain |
| Inbox placement | >95% | <90% = investigate |
| Reply rate | >8% | <5% = fix sequence |
| Positive reply rate | >3% | <1% = ICP wrong |
| Meetings booked/week | >15 | <5 = reassess everything |

Weekly report goes to `operations/sales-reports/outbound-YYYY-Www.md`.

## Scaling safely

Start with 100 emails/cohort, not 1000. Validate the sequence works before scaling.

Sequence of volume growth:
- Week 1: 100 emails (one cohort, careful)
- Week 2: 250 emails (two cohorts, A/B variations)
- Week 3: 500 emails
- Week 4+: up to 1000/week across all active cohorts

Never scale a cohort that isn't hitting reply rate targets. Scaling losers just wastes list and burns domain.

## Anti-patterns (reject these drafts if you see them)

- "Hope this finds you well"
- "I came across your profile..."
- "I wanted to reach out because..."
- "We help {generic category} with {vague promise}"
- Opening with a statistic you made up
- Calendar link in email 1
- Subject line ending with "!"
- Emojis in subject line
- Different voice in different emails of same sequence
- Obvious template variables showing through ({{FirstName}} etc.)

## Domain burn recovery

If domain reputation drops:
1. Pause ALL cohorts from that domain immediately
2. Investigate: bad list? Bad sequence? Warmup too fast?
3. 30-day cool-down, warmup only, no cold volume
4. Resume cautiously with 25 emails/day, triple-check deliverability

Prevention is cheaper than recovery. Check metrics daily.
