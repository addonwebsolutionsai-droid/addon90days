#!/usr/bin/env bash
# ============================================================================
# P02 ChatBase — Smoke Test
# ============================================================================
# Prerequisites:
#   1. Migration 010_p02_chatbase.sql applied to Supabase.
#   2. Local dev server running: cd products/01-claude-reseller/app && npm run dev
#   3. GROQ_API_KEY set in .env.local
#   4. P02_ENCRYPTION_KEY set in .env.local (64 hex chars)
#   5. A workspace created and WORKSPACE_ID exported OR we create one below.
#   6. A valid Clerk session token exported as CLERK_TOKEN.
#
# Usage:
#   export CLERK_TOKEN="<your Clerk session JWT>"
#   export BASE_URL="http://localhost:3000"   # or your Vercel preview URL
#   bash scripts/p02-smoke.sh
# ============================================================================

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
TOKEN="${CLERK_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: CLERK_TOKEN env var is required."
  echo "  Get it from browser DevTools > Application > Cookies > __session"
  exit 1
fi

PASS=0
FAIL=0

check() {
  local label="$1"
  local expected_status="$2"
  local actual_status="$3"
  local body="$4"

  if [[ "$actual_status" == "$expected_status" ]]; then
    echo "  PASS [$label] HTTP $actual_status"
    PASS=$((PASS + 1))
  else
    echo "  FAIL [$label] expected HTTP $expected_status, got $actual_status"
    echo "       body: ${body:0:300}"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=== P02 ChatBase Smoke Test ==="
echo "Base URL: $BASE_URL"
echo ""

# ---------------------------------------------------------------------------
# 1. Create workspace
# ---------------------------------------------------------------------------
echo "--- Step 1: Create workspace ---"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/p02/workspaces" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$TOKEN" \
  -d '{"business_name":"Smoke Test Shop","timezone":"Asia/Kolkata"}')

STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | head -n -1)
check "create-workspace" "201" "$STATUS" "$BODY"

WORKSPACE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  Workspace ID: $WORKSPACE_ID"

if [[ -z "$WORKSPACE_ID" ]]; then
  echo "FATAL: Could not extract workspace_id. Aborting."
  exit 1
fi

# ---------------------------------------------------------------------------
# 2. Get workspace
# ---------------------------------------------------------------------------
echo ""
echo "--- Step 2: Get workspace ---"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/p02/workspaces/$WORKSPACE_ID" \
  -H "Cookie: __session=$TOKEN")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | head -n -1)
check "get-workspace" "200" "$STATUS" "$BODY"

# ---------------------------------------------------------------------------
# 3. Add knowledge base document
# ---------------------------------------------------------------------------
echo ""
echo "--- Step 3: Add KB document ---"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/p02/workspaces/$WORKSPACE_ID/kb" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$TOKEN" \
  -d '{
    "kind": "text",
    "content": "Our business hours are Monday to Saturday, 9 AM to 7 PM IST. We are closed on Sundays. We sell premium hand-crafted pottery. Our bestseller is the terracotta mug at Rs 450. We offer free delivery on orders above Rs 1500. Payment accepted: UPI, cash on delivery, and bank transfer."
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | head -n -1)
check "add-kb-text" "201" "$STATUS" "$BODY"

CHUNK_COUNT=$(echo "$BODY" | grep -o '"chunk_count":[0-9]*' | cut -d: -f2)
echo "  Chunks created: $CHUNK_COUNT"

# ---------------------------------------------------------------------------
# 4. Mock inbound — pricing query (expect AI reply)
# ---------------------------------------------------------------------------
echo ""
echo "--- Step 4: Mock inbound — pricing query ---"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/p02/mock/inbound" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$TOKEN" \
  -d "{
    \"workspace_id\": \"$WORKSPACE_ID\",
    \"customer_phone\": \"+919876543210\",
    \"body\": \"What is the price of the terracotta mug?\",
    \"customer_name\": \"Ramesh Patel\"
  }")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | head -n -1)
check "mock-inbound-price" "200" "$STATUS" "$BODY"

REPLIED=$(echo "$BODY" | grep -o '"replied":true' || echo "")
INTENT=$(echo "$BODY" | grep -o '"intent":"[^"]*"' | cut -d'"' -f4)
CONFIDENCE=$(echo "$BODY" | grep -o '"confidence":[0-9.]*' | cut -d: -f2)
REPLY_BODY=$(echo "$BODY" | grep -o '"reply_body":"[^"]*"' | cut -d'"' -f4 | head -c 100)

echo "  Intent: $INTENT"
echo "  Confidence: $CONFIDENCE"
echo "  Replied: ${REPLIED:-false}"
echo "  Reply preview: ${REPLY_BODY}..."

if [[ -n "$REPLIED" ]]; then
  PASS=$((PASS + 1))
  echo "  PASS [reply-generated] AI reply present in p02_messages"
else
  FAIL=$((FAIL + 1))
  echo "  FAIL [reply-generated] Expected replied=true"
fi

# Extract conversation_id for next tests
CONVERSATION_ID=$(echo "$BODY" | grep -o '"conversation_id":"[^"]*"' | cut -d'"' -f4)
echo "  Conversation ID: $CONVERSATION_ID"

# ---------------------------------------------------------------------------
# 5. Mock inbound — complaint (expect escalation, no reply)
# ---------------------------------------------------------------------------
echo ""
echo "--- Step 5: Mock inbound — complaint (expect escalation) ---"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/p02/mock/inbound" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=$TOKEN" \
  -d "{
    \"workspace_id\": \"$WORKSPACE_ID\",
    \"customer_phone\": \"+919876543211\",
    \"body\": \"This is terrible! My order arrived broken and I want a full refund immediately!\",
    \"customer_name\": \"Angry Customer\"
  }")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | head -n -1)
check "mock-inbound-complaint" "200" "$STATUS" "$BODY"

ESCALATED=$(echo "$BODY" | grep -o '"escalated":true' || echo "")
COMPLAINT_INTENT=$(echo "$BODY" | grep -o '"intent":"[^"]*"' | cut -d'"' -f4)
echo "  Intent: $COMPLAINT_INTENT"
echo "  Escalated: ${ESCALATED:-false}"

if [[ -n "$ESCALATED" ]] || [[ "$COMPLAINT_INTENT" == "complaint" ]]; then
  PASS=$((PASS + 1))
  echo "  PASS [complaint-escalation] Complaint correctly escalated"
else
  FAIL=$((FAIL + 1))
  echo "  FAIL [complaint-escalation] Expected escalated=true for complaint"
fi

# ---------------------------------------------------------------------------
# 6. List conversations
# ---------------------------------------------------------------------------
echo ""
echo "--- Step 6: List conversations ---"
RESP=$(curl -s -w "\n%{http_code}" \
  "$BASE_URL/api/p02/workspaces/$WORKSPACE_ID/conversations?limit=10" \
  -H "Cookie: __session=$TOKEN")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | head -n -1)
check "list-conversations" "200" "$STATUS" "$BODY"

CONV_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l)
echo "  Conversations returned: $CONV_COUNT"

# ---------------------------------------------------------------------------
# 7. Human take-over
# ---------------------------------------------------------------------------
if [[ -n "$CONVERSATION_ID" ]]; then
  echo ""
  echo "--- Step 7: Human take-over ---"
  RESP=$(curl -s -w "\n%{http_code}" -X POST \
    "$BASE_URL/api/p02/conversations/$CONVERSATION_ID/take-over" \
    -H "Cookie: __session=$TOKEN")
  STATUS=$(echo "$RESP" | tail -1)
  BODY=$(echo "$RESP" | head -n -1)
  check "take-over" "200" "$STATUS" "$BODY"

  # 8. Human send
  echo ""
  echo "--- Step 8: Human send message ---"
  RESP=$(curl -s -w "\n%{http_code}" -X POST \
    "$BASE_URL/api/p02/conversations/$CONVERSATION_ID/send" \
    -H "Content-Type: application/json" \
    -H "Cookie: __session=$TOKEN" \
    -d '{"body":"Hi Ramesh, the terracotta mug is Rs 450. Free delivery above Rs 1500!"}')
  STATUS=$(echo "$RESP" | tail -1)
  BODY=$(echo "$RESP" | head -n -1)
  check "human-send" "200" "$STATUS" "$BODY"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
if [[ $FAIL -gt 0 ]]; then
  echo "SMOKE TEST FAILED"
  exit 1
else
  echo "SMOKE TEST PASSED"
  exit 0
fi
