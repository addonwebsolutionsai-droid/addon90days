# Visual Assets — Banners, Posts, Videos

**How we produce high-volume visual content without a human designer on staff.**

Owner: `@product-designer` leads; `@ui-builder` executes web/product visuals; AI image generation fills the gap; founder approves the visual direction once (quarterly), not every piece.

---

## Asset types we need

| Asset | Weekly volume | Who makes it | Time budget/asset |
|---|---|---|---|
| LinkedIn post visuals | 5-8 | AI + designer review | 10 min |
| LinkedIn carousel | 1-2 | `@product-designer` brief + tool | 45 min |
| X post visuals | 5-10 | Mostly screenshots + simple diagrams | 5-10 min |
| X thread graphics | 1-3 | `@product-designer` | 20 min |
| YouTube thumbnail | 1 | `@product-designer` + AI assist | 30 min |
| Blog post header image | 2-3 | AI gen + overlay | 10 min |
| Instagram posts (if active) | 3-6 | AI + designer | 10 min |
| Product screenshots | As needed | `@ui-builder` | 5 min |
| Diagrams (architecture, flow) | 2-4 | Excalidraw + `@product-designer` | 15-30 min |
| Email newsletter header | 1 | `@product-designer` | 15 min |
| Landing page hero visuals | 1-2 | `@ui-builder` + `@product-designer` | 1-2 hours |
| Product demo video | Per launch | `@product-designer` + founder | 3-4 hours |
| Ad creative (static + video) | 5-10/campaign | AI gen + `@product-designer` | 15-30 min/each |

---

## Tooling stack

| Tool | Purpose | Cost |
|---|---|---|
| **Figma** (optional) | Hi-fi mockups when needed; agents don't use Figma but founder can | $15/mo |
| **Excalidraw** | Architectural diagrams, flow charts | Free |
| **Canva Pro** | Templates, easy banner/post production | $13/mo |
| **Midjourney** | AI image generation for hero/editorial | $10-30/mo |
| **Flux Schnell / DALL-E / Stable Diffusion** | Alternative/backup image gen | API-based |
| **Remove.bg** | Background removal for product shots | $10/mo |
| **Descript** | Video editing with AI captioning | $15/mo |
| **Lottielab** | Animated elements for product pages | $25/mo |
| **CleanShot X** (Mac) | Screenshots with consistent styling | $10 one-time |

Budget: ~$100/month for design tooling total.

---

## Visual design direction (follows `DESIGN_STANDARDS.md`)

### Parent brand (AddonWeb) visual language

Starting point — refined after founder reviews `inspiration/brands.md`:
- **Color palette:** charcoal near-black + warm off-white + one restrained accent (decide based on inspiration)
- **Typography:**
  - Display: a confident, slightly unusual serif (Instrument Serif, Fraunces, or similar)
  - Body: Inter or IBM Plex Sans
  - Monospace: JetBrains Mono
- **Imagery approach:**
  - Heavy use of screenshots and product moments
  - Founder's actual face (not a dressed-up portrait)
  - Diagrams drawn in our style (consistent stroke weight, limited colors)
  - Avoid: stock photography, illustration-of-people-using-laptops, abstract flowing shapes

### Per-product visual language

See each product PRD + `inspiration/product-design.md`. Starting directions:
- **Claude Toolkit (P01):** black + simple, developer tool aesthetic, low decoration
- **ChatBase (P02):** WhatsApp-green adjacent but distinct, friendly, mobile-first
- **TaxPilot (P03):** deep blue, trustworthy, clean typography, compliance-feel
- **TableFlow (P04):** warm earthy tones, approachable, works on tablet in bright restaurant
- **ConnectOne (P05):** teal/electric blue, mono for device IDs, technical
- **MachineGuard (P06):** dark charcoal + amber alert accents, industrial, data-dense

---

## Templates (create once, use forever)

### LinkedIn post templates (4-6 designs)
Consistent look across posts, easy for `@paid-ops-marketer` to fill:
- Template 1: Solid background + large display text (for thought-leadership quotes)
- Template 2: Code snippet screenshot + our attribution badge
- Template 3: Diagram holder (we drop an Excalidraw export in)
- Template 4: Numbers template ("$X MRR", "N agents", etc.)
- Template 5: Product screenshot frame with caption
- Template 6: Quote template (customer quote with attribution)

Build these in Canva/Figma. One-time cost, weeks of reuse.

### LinkedIn carousel template (1 design)
- 10-slide template with consistent title/body/image areas
- Slide 1 = hook, Slide 10 = CTA
- Brand watermark corner-bottom

### X post visual template (3-4 designs)
- Quote card
- Code snippet frame
- Diagram holder
- Small data viz (simple bars, simple lines)

### YouTube thumbnail template (2 formulas)
- **Formula A:** founder face (half) + bold text claim + number
- **Formula B:** product screenshot + title + our watermark
- Always: legible at 50% size, high contrast, no more than 6 words

### Blog post header template (3 variations)
- AI-generated illustration (editorial)
- Diagram (for technical posts)
- Photo (for rare personal/behind-scenes posts)

### Email newsletter template (1 design)
- Clean, text-first
- Our logo top
- Single hero image optional
- Plain text body with standard Markdown→HTML rendering

### Ad creative templates (per platform)
- LinkedIn static: 3 variations with different emotional angles
- LinkedIn video: 15-second sizzle + 30-second demo + 60-second story
- Meta: square + vertical versions
- X promoted post: single-image + thread style
- YouTube pre-roll: 15-second hook

---

## AI image generation workflow

For blog headers, social visuals, and ad creative where photography isn't appropriate:

### Prompt engineering (for brand consistency)

Maintain `operations/brand-visual-prompts.md` with:
- Base style prompt: "editorial illustration, clean, warm neutrals, one accent color, technical aesthetic, no people, no gradients, sharp edges"
- Banned elements: "no gradients, no people pointing at laptops, no abstract swooshes, no overly-smooth 3D, no glowing effects"
- Reference images we approve (save to `inspiration/approved-ai-refs/`)

### Generation process
1. `@product-designer` writes prompt variation for the piece
2. Generate 4-8 options via Midjourney/Flux
3. Select top 2
4. Apply brand overlay (text, watermark) in Canva
5. Publish

### Cost discipline
- Midjourney subscription: $30/mo = ~200 generations/mo
- For high-volume needs (ad campaigns), shift to API-based generation with better unit economics
- Never generate when a screenshot or real photo would work better

---

## Screenshot hygiene (the workhorse visual)

Most of our social content uses product screenshots. Rules:

- **Consistent window styling** — CleanShot X with macOS Light theme, custom background color
- **Blur sensitive data** — never leak customer info or our own secrets
- **Real data over "lorem ipsum"** — realistic data builds trust
- **Annotate with purpose** — arrows/highlights only where they add understanding
- **Crop with intent** — show enough context; don't zoom so tight the product feels fake
- **Consistent resolution** — standard sizes per platform (LinkedIn 1200x627, X 1200x675, etc.)

Saved originals in `products/00-addonweb/screenshots/` so we can re-crop without regenerating.

---

## Diagrams in our style

Technical posts need diagrams. Consistency across diagrams = brand recognition.

**Tool:** Excalidraw (free, exports clean SVG/PNG).

**Style:**
- Hand-drawn feel but readable
- Two colors max: neutral + accent
- No shadows
- Consistent stroke weight
- Labels in the body font we use elsewhere
- Add a small "addonweb" watermark bottom-right on the PNG export

Maintain template Excalidraw files in `products/00-addonweb/diagram-templates/` so new diagrams start consistent.

---

## Video production pipeline

### Short-form (15-60 sec)
- Typically from founder's YouTube videos (cut down to clip-worthy moments)
- Use Descript to identify high-engagement moments, auto-cut
- Add captions (always — most people watch muted)
- Export vertical 9:16 for TikTok/Reels/Shorts + horizontal 16:9 for X
- Watermark our handle in a corner

### Medium-form (1-3 min product demos)
- Script by `@content-marketer`
- Screen recording with founder narration
- Edit in Descript (fillers out, sections titled, music bed from licensed library)
- Thumbnail by `@product-designer`

### Long-form (8-15 min YouTube weekly)
- Script by `@content-marketer`
- Founder records in one take or multiple (Descript handles stitching)
- Edited with purposeful pacing
- Chapters in description
- End screen promoting next video + newsletter

---

## Visual QA checklist (run before any asset publishes)

- [ ] Matches brand-visual direction for the relevant product
- [ ] All text legible at intended viewing size
- [ ] Accessibility contrast passed (for text-on-image)
- [ ] No copyright/licensing issues (stock footage, fonts, music)
- [ ] Sensitive info blurred (customer names, API keys, internal data)
- [ ] Watermark present where applicable
- [ ] Correct dimensions for target platform
- [ ] File size reasonable (compressed appropriately)
- [ ] Version-controlled (originals saved in project folder)

---

## What we DON'T do

- **Stock photos of people** — always feels fake, always. Either use real photos (founder, customers with permission) or go illustration.
- **Trendy AI aesthetics** — the "hazy gradient with floating 3D objects" look will age terribly. Boring + timeless wins.
- **Fake screenshots** — staged UI that doesn't exist in the product is a trust violation.
- **Inconsistent watermarks** — either watermark everything or nothing; random is worse than either.
- **Carousel for the sake of carousel** — if the content doesn't need 10 slides, don't force 10 slides.
- **Text-heavy graphics** — reading on Instagram/LinkedIn is punished. Short bold claims > paragraphs.

---

## Monthly visual review

First Monday of each month, `@product-designer` + `@cmo` + founder review:
- Which visuals performed best (engagement, CTR)
- Which format/style pattern is winning
- What to retire (templates that aren't landing)
- What to add to the library

Findings inform next month's production.

---

## Escalate to founder when

- A new brand direction (new accent color, new font family) is being considered
- An ad campaign visual that represents the brand to a cold audience for the first time
- Any visual featuring founder's likeness in an unusual context
- A visual that references or adapts a competitor's design (IP risk)
