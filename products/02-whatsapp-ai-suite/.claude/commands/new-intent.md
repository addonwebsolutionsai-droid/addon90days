# /new-intent

Adds a new intent handler to the ChatBase AI agent.

## Usage
```
/new-intent price-inquiry "User is asking about product prices"
```

## What This Creates
```
api/src/intents/<name>/
  handler.ts          ← Intent handler function
  examples.json       ← 10+ training examples for classifier
  prompt.ts           ← Claude prompt for response generation
  __tests__/
    handler.test.ts
```

And registers in `api/src/intents/router.ts`

## Required Structure
```typescript
export const intentName: Intent = {
  name: string,
  description: string,
  examples: string[],    // used for few-shot classification
  confidence_threshold: number,  // 0.0–1.0
  handler: async (message, context) => IntentResponse,
  escalate_on_failure: boolean,
}
```

## Built-in Intents (do not recreate)
- price-inquiry ✓
- order-placement ✓
- invoice-request ✓
- payment-status ✓
- complaint → always escalates
- greeting → standard response
- unknown → clarification request
