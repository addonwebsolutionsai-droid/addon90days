# Inspiration — Your Manual Fill Space

**This is YOUR (founder's) space.** Drop in references here. Agents read from here before any design or rebranding task.

Without inputs from you, agents default to generic best-practice. With your references, designs match your taste.

---

## How to use this space

These are plain markdown files. You edit them in any text editor (VSCode, TextEdit, Sublime, Typora, whatever).

**Just paste in:**
- URLs of websites you like
- Screenshot descriptions ("the way Stripe's pricing page breaks down tiers")
- Names of products whose aesthetic you admire
- Colors you want to avoid
- Fonts you've seen and liked
- Specific feature demos that impressed you
- Competitor examples (and what you'd do differently)
- Magazines / print design / book covers — anything visual is fair game

**Format is flexible.** Bullets, paragraphs, just URLs — whatever helps you capture. Agents are smart enough to parse.

**Update as you go.** Every time you see something cool, drop it in. Over 90 days, this library becomes extremely valuable.

---

## Files in this directory

- `README.md` — you are here
- `websites.md` — website designs you like
- `brands.md` — brand identities you admire
- `product-design.md` — app / product UI/UX inspiration
- `content.md` — writing, posts, articles you think are great
- `videos.md` — video styles / YouTube channels / ad creative references
- `approved-ai-refs/` — folder for AI-generation reference images (drop image files here)

---

## When agents use these files

**Before starting any of these tasks, agents load the relevant file:**

| Task | Inspiration file loaded |
|---|---|
| Rebranding addonwebsolutions.com | `websites.md` + `brands.md` |
| Product landing page design | `websites.md` (especially landing-page section) + `product-design.md` |
| New product UI design | `product-design.md` + that product's PRD |
| Writing a flagship blog post | `content.md` |
| Creating a YouTube video | `videos.md` |
| AI image generation | `approved-ai-refs/` |

---

## What makes a good inspiration entry

### Good:
> **Linear (linear.app)** — I love the keyboard-first interaction model. Every action has a keyboard shortcut. The way they let you jump between projects with `cmd+k` is what I want for our TaxPilot and MachineGuard dashboards.

(Specific, tied to our work, with a "why" attached.)

### Less useful:
> **Linear** — it's great

(No "why," no tie-in to our work. Agents can't do much with this.)

### Also good:
> **Stripe pricing page** — the way they show "for every business size" without making it feel like a downgrade on the cheaper tiers. Our ChatBase pricing page should feel similar — the Starter tier shouldn't look like "the loser plan."

(Specific design move + our application of it.)

---

## Maintenance

- **Don't delete old entries** even if you change your mind — note the change instead. "Originally liked X, now prefer Y because Z" is useful history for agents.
- **Add timestamps** when useful ("added 2026-05-01 after seeing their redesign").
- **Don't worry about being comprehensive** — 3-5 great refs beat 30 mediocre ones.

---

## If a file is empty

Agents will see that a file hasn't been filled in and will either:
1. Ask you to populate it before proceeding (for design work)
2. Use sensible defaults (for urgent/time-sensitive work)
3. Note in their output that design was done without your inspiration and recommend review

So empty files aren't broken — they just mean defaults kick in.

---

## Privacy note

Files in this directory are gitignored by default in the bundle (see `.gitignore`) — your personal taste shouldn't leak to a public repo if you decide to open-source parts of this system later. If you want them committed, remove the `inspiration/` entry from `.gitignore`.

Actually — let's review that. Currently `.gitignore` does NOT exclude `inspiration/`. You may want to add it if you ever push this to a public repo. For now, it's tracked (so you don't lose your work).
