# Diagnostic — Cloud Routines, 2026-05-01

**Author:** @cto
**Scope:** Why did 3 of 4 daily cloud routines fail to commit today, with no Telegram error?

## Observed

| Routine | Scheduled (IST) | Cron (UTC) | Outcome today | Outcome yesterday |
|---|---|---|---|---|
| Morning Orchestrator | 09:00 | 03:30 | ✅ committed `a151596` (filed at 14:09 IST — 5 hr lag, but landed) | ✅ `e109927` |
| Content Marketer     | 10:00 | 04:30 | ❌ no commit, no Telegram alert | (not on yesterday's audit window) |
| Outbound Sales       | 11:00 | 05:30 | ❌ no commit, no Telegram alert | — |
| Problem Scout        | 12:00 | 06:30 | ❌ no commit, no Telegram alert | — |

`git log --since="2026-05-01 00:00" --pretty=fuller` confirms only `a151596` from `addonwebsolutionsai-droid` lands today. No commits from `AddonWeb Orchestrator <ops@addonweb.io>` or any other routine identity.

The morning routine commit was **5 hours late** (14:09 IST vs scheduled 09:00 IST). That timing is suspicious — it implies either:
- the routine sat queued for hours at Anthropic side, or
- the routine retried internally several times, or
- this is the founder manually triggering the routine via /run (Telegram bot supports `/run morning`) after noticing the auto-fire failed.

## Most likely root cause

**The shell helper `commit_repo_file` returns success on a 4xx/5xx HTTP response from `api.github.com` because the routine prompts use bash without `set -e` and parse the GitHub Contents API response by string-matching `"sha"` rather than checking HTTP status.** When a routine's LLM step produces an empty body, or when the SHA conflict on a same-day file write fires (HTTP 409), curl exits 0 but the response body is `{"message":"...","status":"409"}` — no `sha` field — and the helper silently returns "OK" without retrying or alerting.

The morning routine appears to have a different code path (it ALWAYS writes a fresh file `operations/daily-log/YYYY-MM-DD.md` which has no pre-existing SHA conflict possibility on Day 1 of the date). The other three routines write to OTHER paths that may already exist — which would 409 on first PUT without `sha`.

## Alternative hypotheses, ranked

1. **(P ≈ 0.55)** SHA-conflict on same-day idempotent write → silent failure, as above.
2. **(P ≈ 0.20)** LLM returned empty / refusal → prompt has no fallback that always emits a stub file → `commit_repo_file` is never reached → exit clean.
3. **(P ≈ 0.10)** Anthropic cron fired but the agent container died during init (rare; would normally show in Anthropic dashboard logs).
4. **(P ≈ 0.10)** Anthropic per-routine rate limit OR shared org-level concurrency cap (we have 7 routines with two scheduled within an hour of each other — 03:30, 04:30, 05:30, 06:30 UTC — possible queue back-pressure).
5. **(P ≈ 0.05)** Telegram POST in the error path uses the SAME bash helper that swallows the curl exit — so even when the routine *does* try to alert, the alert silently fails too.

## Why no Telegram alert fired

Either (a) the routine never reached its error path because `commit_repo_file` returned success, or (b) the Telegram POST itself uses the same swallow-the-exit pattern. Both are fixable.

## Concrete fix

**One patch, applied to all 6 cloud routine prompts** via the RemoteTrigger `update` action.

Replace the existing `commit_repo_file` shell helper in each routine prompt with this version:

```bash
commit_repo_file() {
  local path="$1"
  local content_b64="$2"
  local message="$3"

  # Get current SHA for upsert (if file exists). 200 = exists, 404 = new.
  local sha_resp
  sha_resp=$(curl -sS -w "\n%{http_code}" \
    -H "Authorization: Bearer $GH_PAT" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/addonwebsolutionsai-droid/addon90days/contents/$path")
  local sha_code="${sha_resp##*$'\n'}"
  local sha_body="${sha_resp%$'\n'*}"

  local sha=""
  if [[ "$sha_code" == "200" ]]; then
    sha=$(echo "$sha_body" | grep -o '"sha":[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"sha":[[:space:]]*"\([^"]*\)".*/\1/')
  elif [[ "$sha_code" != "404" ]]; then
    notify_telegram "⚠️ commit_repo_file: SHA fetch returned $sha_code for $path"
    return 1
  fi

  local body
  if [[ -n "$sha" ]]; then
    body=$(printf '{"message":"%s","content":"%s","sha":"%s","committer":{"name":"AddonWeb %s","email":"ops@addonweb.io"}}' \
      "$message" "$content_b64" "$sha" "$ROUTINE_NAME")
  else
    body=$(printf '{"message":"%s","content":"%s","committer":{"name":"AddonWeb %s","email":"ops@addonweb.io"}}' \
      "$message" "$content_b64" "$ROUTINE_NAME")
  fi

  local put_resp
  put_resp=$(curl -sS -w "\n%{http_code}" -X PUT \
    -H "Authorization: Bearer $GH_PAT" \
    -H "Accept: application/vnd.github+json" \
    -d "$body" \
    "https://api.github.com/repos/addonwebsolutionsai-droid/addon90days/contents/$path")
  local put_code="${put_resp##*$'\n'}"
  local put_body="${put_resp%$'\n'*}"

  if [[ "$put_code" != "200" && "$put_code" != "201" ]]; then
    notify_telegram "❌ $ROUTINE_NAME failed to commit $path (HTTP $put_code): $(echo "$put_body" | head -c 300)"
    return 1
  fi
  return 0
}

notify_telegram() {
  local text="$1"
  curl -sS -X POST \
    -d "chat_id=$TELEGRAM_CHAT_ID" \
    -d "text=$text" \
    "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" >/dev/null || true
}
```

**And add this prompt-level fallback at the END of every routine prompt** (after the main task instructions):

> If for any reason you cannot generate the expected output (LLM refusal, empty response, tool failure), you MUST still commit a stub file at the canonical path with the body:
>
> ```
> # {ROUTINE_NAME} — {YYYY-MM-DD}
>
> _Routine fired but produced no output. Manual intervention may be required._
>
> Reason: {one-line explanation if known}
> ```
>
> Then call `notify_telegram` with the same one-line explanation. NEVER exit 0 silently.

This guarantees:
1. Every fired routine produces exactly one commit (stub or full content).
2. Every silent failure becomes a visible Telegram alert.
3. SHA conflicts on idempotent same-day writes are handled correctly.

## Verification plan

After founder applies the patch via RemoteTrigger `update`:

1. Trigger each routine manually via Telegram bot (`/run content`, `/run outbound`, `/run scout`).
2. Confirm one commit per routine within 2 minutes of `/run`.
3. Force a failure: temporarily rotate `GH_PAT` to an invalid value, trigger again, confirm Telegram alert fires.
4. Restore `GH_PAT`, confirm next scheduled run commits cleanly.

## Routines requiring this patch

All 6 active cloud routines:

- Morning Orchestrator — `trig_0186i6NRosRwyi7m5X8WSfkN` (works today, but apply for safety)
- Content Marketer     — `trig_017TpJzAjmHLSFmS1Pgn71G5`
- Outbound Sales       — `trig_01WaD1WqQxtGvphtinTyN131`
- Problem Scout        — `trig_01RRfNPMURXD6xC53MEHyQTP`
- EOD Orchestrator     — `trig_013Z2JMxKUud5nh8tcY4JGGT`
- CMO Weekly           — `trig_01TH85TFyxc7XdFurZQ4hJKP`

Patch action for each: RemoteTrigger `update` with body containing the new helper + fallback paragraph. Founder applies after review (PAT lives only in claude.ai routine prompts — I cannot apply directly).

## Note on the morning-routine 5-hour lag

Even though the morning routine committed today, the 5h13m lag (scheduled 09:00 IST → committed 14:09 IST) suggests Anthropic-side queue delay or a retry loop. Worth opening a support ticket with Anthropic if it recurs. Not blocking, but a SLA risk for routines with hard time-of-day expectations (EOD summary at 17:00 IST is read by founder before bed).

— @cto
