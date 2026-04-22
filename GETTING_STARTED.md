# GETTING_STARTED.md — Day 0 Setup

**Goal:** Go from "I have this folder" to "agents are working for me" in 3 hours.

Follow every step. Do not skip. If you get stuck, ask Claude in the web app first, then come back.

---

## Part 1 — Accounts you need (30 min, do this BEFORE touching the terminal)

Create these and save the API keys/tokens in a text file temporarily. We'll move them to `.env` in Part 3.

1. **Anthropic Console** → https://console.anthropic.com
   - Sign up, add billing method, purchase $500 in credits to start.
   - Create an API key named `addonweb-agents-prod`. Save it.
   - Set monthly spend cap: **$5,000**. Set email alert at 80%.

2. **GitHub** → https://github.com
   - Create a new organization: `addonweb-ai` (or use your existing one).
   - Create an empty private repo: `ai-factory`.
   - Generate a Personal Access Token with `repo` + `workflow` scopes. Save it.

3. **Slack** → https://slack.com
   - Create a new workspace: `AddonWeb AI Factory`.
   - Create channels: `#standups`, `#approvals`, `#shipped`, `#sales-pipeline`, `#problems-radar`, `#alerts`.
   - Create an Incoming Webhook (Slack → Apps → Incoming Webhooks). Save the URL.

4. **Linear** → https://linear.app
   - Free plan. Create workspace `AddonWeb`.
   - Create teams: `Product`, `Growth`, `Revenue`.
   - Get API key (Settings → API). Save it.

5. **HubSpot Free** → https://hubspot.com (or Attio if you prefer)
   - Free CRM. Get API key. Save it.

6. **Vercel** → https://vercel.com
   - Sign up with your GitHub. Link `addonweb-ai` org.

7. **Railway or Fly.io** → https://railway.app (easier) or https://fly.io
   - Sign up. Add billing. Save deploy token.

8. **PostHog Cloud** → https://posthog.com
   - Free tier for now. Save project API key.

9. **Apollo.io** → https://apollo.io
   - Basic paid plan ($49/mo) for lead data. Save API key.

10. **Instantly.ai** → https://instantly.ai
    - Starter plan (~$37/mo) for outbound. Save API key.

**Total monthly tool cost (before Claude API): ~$150–$250.**
**Claude API burn: ~$2,500–$5,000/month.**
**Total: $2,700–$5,250/month** running a 13-agent company.

---

## Part 2 — Install Claude Code (15 min)

**Requirements:**
- macOS, Linux, or Windows (WSL recommended on Windows)
- Node.js 20 or newer (`node --version` to check)

**Install:**

```bash
npm install -g @anthropic-ai/claude-code
```

**Authenticate:**

```bash
claude
# First run prompts you to paste your Anthropic API key.
# Paste the one you saved in Part 1, step 1.
```

**Verify:**

```bash
claude --version
```

You should see a version number. If not, check Node version and re-install.

---

## Part 3 — Set up this project (20 min)

**Put the folder where you want it:**

```bash
cd ~/Projects  # or wherever you keep code
# The addonweb-ai-factory folder should be sitting here
cd addonweb-ai-factory
```

**Initialize git and push to your GitHub repo:**

```bash
git init
git add .
git commit -m "Initial AI factory setup"
git remote add origin git@github.com:addonweb-ai/ai-factory.git
git branch -M main
git push -u origin main
```

**Create your `.env` file** (this is NOT committed — `.gitignore` will block it):

```bash
cat > .env << 'EOF'
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Integrations
GITHUB_TOKEN=ghp_...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
LINEAR_API_KEY=lin_api_...
HUBSPOT_API_KEY=...
POSTHOG_API_KEY=...
APOLLO_API_KEY=...
INSTANTLY_API_KEY=...

# Deployment
VERCEL_TOKEN=...
RAILWAY_TOKEN=...

# Company config
COMPANY_NAME=AddonWebSolutions
FOUNDER_EMAIL=you@addonwebsolutions.com
FOUNDER_TIMEZONE=Asia/Kolkata
EOF
```

**Add `.gitignore`:**

```bash
cat > .gitignore << 'EOF'
.env
.env.local
node_modules/
.DS_Store
*.log
.claude/local/
outputs/
EOF
```

**Paste your saved keys into `.env`.** Save the file.

---

## Part 4 — First agent run (10 min)

In the `addonweb-ai-factory` folder:

```bash
claude
```

Claude Code starts. It automatically loads `CLAUDE.md` (project memory) and discovers all 13 agents in `.claude/agents/`.

**Type this exact command:**

```
/daily-standup
```

The orchestrator agent will:
1. Greet you
2. Report: "It's Day 1. Here's what the roadmap says we do today."
3. Delegate the Day 1 tasks to the right specialist agents
4. Come back with: "Here are the 3 decisions I need from you"

**You approve or redirect.** That's it. You've just run your AI company for the first time.

---

## Part 5 — Daily rhythm (permanent)

**Every weekday at 9:00 AM your time:**

```bash
cd ~/Projects/addonweb-ai-factory
claude
/daily-standup
```

Spend ~60 minutes:
1. Read the orchestrator's briefing
2. Approve/reject/redirect the day's proposals
3. Check `#approvals` in Slack for anything waiting
4. Close the session — agents continue their work

**Every Friday at 4:00 PM:**

```
/weekly-review
```

This runs the Friday retro. You decide: kill, keep, or scale each active initiative.

---

## Part 6 — Troubleshooting

**"Agent not found" when I type `@cto`** → Run `ls .claude/agents/` to confirm files exist. Restart Claude Code.

**API rate limits hit** → You've gone over the monthly cap. Check Anthropic Console. Also check `operations/kpis.md` for burn tracking.

**Agent produces garbage output** → Edit its `.md` file in `.claude/agents/` — tighten the description field (that's the routing hint) and the system prompt. Commit the change.

**I want to pause an agent** → Rename its file to `_archived_<name>.md` or delete it. Claude Code will stop routing to it.

**I want to add a new agent** → Copy an existing one in `.claude/agents/`, rename, edit the frontmatter and prompt. Commit.

---

## Part 7 — What you should expect

**Week 1:** Rough. Agents will misfire. You'll redirect often. Budget 2–3 hours/day to supervise. Tighten prompts as you go.

**Week 2:** Better. Agents know your voice. Supervise drops to 90 min/day.

**Week 4:** First public launch. Anxiety peak. Real customer feedback starts.

**Week 8:** System hums. 45–60 min/day of operations. You're doing strategy and enterprise sales.

**Week 12:** You're running 2–4 products, first enterprise contract in flight, 100+ customers total across the product line. Your founder workload is lower than when you had employees.

---

**Next step:** Read `CLAUDE.md` (so you understand what Claude Code sees at the start of every session), then open `roadmap/daily-runbook.md` and execute Day 1.

Let's go.
