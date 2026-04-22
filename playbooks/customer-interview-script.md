# Customer Interview Script Playbook

How to run a validation interview that gets real signal, not polite lies.

## Goals of an interview

In 15 minutes, learn:
1. **Is this problem real for you?** (not hypothetical)
2. **How painful is it?** (intensity, money lost, time wasted)
3. **What are you doing today?** (current solution or workaround)
4. **What would it take for you to switch?** (willingness to pay + activation energy)
5. **Would you be a design partner?** (the strongest signal)

## Rules for not fooling yourself

These are taken from Rob Fitzpatrick's "The Mom Test" — read it if you haven't.

### Do
- Ask about **past behavior**, not future hypotheticals
- Ask about **specific examples**, not abstractions
- Let them talk — silence is good
- Dig into their current workaround in detail
- Ask "how much does it cost you when X happens?"
- Ask "what did you try before?"
- Ask "who else has this problem?"

### Don't
- Don't pitch your idea in the interview
- Don't describe your product in the interview
- Don't ask "would you buy it?"
- Don't ask "would you use a product that does X?"
- Don't correct their perception of a competitor
- Don't promise features
- Don't argue with their opinion

If the person says "that sounds interesting", you probably just failed the interview. They're being polite.

## Interview flow (15 min)

### Minutes 0-2: Intro
- Thank them
- Set expectations: "I'm not selling anything today. I'm trying to learn if we should build something. If we don't build what you need, I'd rather know that now."
- Permission to record (for your own notes only)

### Minutes 2-5: Their world
- "Tell me about your role and day-to-day."
- "What are the 2-3 most annoying parts of your week right now?"
- Listen. If they mention the problem you care about, great — if they don't, probe into it after they've listed what THEY find annoying.

### Minutes 5-10: The problem
- "Earlier you mentioned {problem}. Tell me about the last time this happened."
- "What did you do?"
- "How long did it take?"
- "Did it cost you money? Time? A relationship?"
- "How often does this happen?"
- "What have you tried to fix it?"
- "Why didn't that work?"

### Minutes 10-13: Current solution / willingness to pay
- "What are you using today to handle this?"
- "What do you pay for it?"
- "What would it take for you to stop using {current solution}?"
- "If you could wave a magic wand and have the perfect solution, what would it look like?"
- **Do NOT describe your product here.** Let them describe THEIR ideal.

### Minutes 13-15: The ask
- "If we built something along the lines of what you described, would you want to be one of the first 5 users?"
- "Would you be willing to co-design it with us and give feedback every couple of weeks?"
- If yes, set a follow-up. If they hedge, believe the hedge.
- "Who else has this problem that I should talk to?"

## What you're looking for (signal)

### Strong GO signals
- They describe the problem in vivid, specific detail with money or time attached
- Their current workaround is clearly painful and expensive
- They've tried to solve it before (and failed)
- They spontaneously volunteer to be a design partner
- They offer to introduce you to 2-3 others with the same problem
- They push back on the price in a way that means they're serious ("that's too much" vs. "how much?")

### Weak / NO-GO signals
- They use abstract language ("I guess it would be nice if...")
- They can't recall a specific recent instance of the problem
- "That sounds interesting"
- They suggest features instead of describing pain
- They defer to "my colleague would know more"
- They check their watch before minute 10
- Generic "yes" without digging

## Post-interview

Within 30 minutes of ending:
- Write raw notes — quotes, specifics, tone observations
- Rate signal on each goal (1-5)
- Flag any quote that could be a marketing headline
- Flag any feature request you heard (separate from the core problem)
- Follow up with thank-you + calendar invite for next touch if they agreed to be a design partner

## Avoiding interview bias

- Don't interview friends/family unless they're exactly ICP (otherwise they'll be polite)
- Don't interview someone who has already bought from you (too invested)
- Don't interview someone who HATES your competitor (they'll be biased)
- Target: cold, ICP-perfect, busy strangers. They'll be honest because they don't care about sparing your feelings.

## Source of interviewees

- Warm intros from network (easiest)
- Cold LinkedIn DMs offering $25 gift card or $50 Amazon voucher
- Reddit/community calls ("Hey, we're researching a tool for X — willing to swap 15 min for a $25 Amazon gift card?")
- Upwork short posts: "Want to interview construction firm owners about their site management process — paid $50 for 20 min"

## Volume needed

For a clean GO/NO-GO:
- **8-12 interviews** with exact-ICP matches
- If first 5 are all polite but non-specific → your ICP is wrong or the problem isn't real
- If first 5 are all enthusiastic with specifics → you're probably onto something, finish the batch to confirm

## Report format

`operations/validation/{idea-slug}/interviews.md`:

```markdown
# Interview: {Name}, {Role at Company}
Date: {}
Duration: {}

## Context
{Brief notes on their role, company, setup}

## Key quotes (verbatim)
- "..."
- "..."

## Current workaround
{What they do today, in detail}

## Pain intensity (1-5)
{With specific anchor — money lost, time wasted, etc.}

## WTP signal
{Strong / Medium / Weak / None — with evidence}

## Design partner offer
{Yes / No / Hedge}

## My takeaway
{One paragraph — what this interview changed about my hypothesis}

## Follow-up
{What's next with this person}
```

## Decision framework

After 8-12 interviews, aggregate:

| Signal | Count | What it means |
|---|---|---|
| Strong GO | X/12 | |
| Weak/Polite | X/12 | |
| Clear NO | X/12 | |
| Design partner offers | X/12 | |

Decision:
- **GO if:** 6+ strong go AND 3+ design partner offers
- **PIVOT if:** 6+ confirmed the broader problem area but 2+ defined it differently than expected
- **NO-GO if:** <4 strong go signals
- **RE-RUN if:** inconclusive or ICP seems off

Ship the report to `operations/validation/{idea-slug}/report.md` — feed into `@idea-validator`'s final GO/NO-GO recommendation.
