# Decisions Log

**All non-trivial decisions get an ADR here.** When an agent or founder makes a structural choice — architecture, strategy, positioning, kill/keep — it's recorded so we remember WHY later.

## Format (ADR template)

Create a file `operations/decisions/YYYY-MM-DD-slug.md`:

```markdown
# Decision: {title}

**Date:** {YYYY-MM-DD}
**Made by:** {@agent or founder}
**Status:** {proposed / accepted / superseded}
**Supersedes:** {link to previous decision, if any}

## Context
{What's the situation? Why does this need deciding?}

## Options considered
1. **Option A:** {description}
   - Pros: ...
   - Cons: ...
2. **Option B:** {description}
   - Pros: ...
   - Cons: ...
3. **Option C:** {description, or "do nothing"}
   - Pros: ...
   - Cons: ...

## Decision
{Which option, and why}

## Consequences
- What changes because of this?
- What do we need to watch?
- What would cause us to revisit?
```

## Current decisions

*(File your decisions as markdown files in this directory. Add links to the most important ones below for quick reference.)*

### Architectural decisions
- *(Add as decisions are made)*

### Product decisions
- *(Add as decisions are made)*

### Strategic decisions
- *(Add as decisions are made)*

### Decisions that got REVERSED (learn from these)
- *(These are the most valuable to keep visible)*

## When to write an ADR

Write an ADR for:
- Any architectural choice that would be hard to change later
- Any technology pick with high switching cost
- Any kill decision (so we don't re-propose the same idea)
- Any pricing change
- Any positioning change
- Any major process change (e.g., who approves what)

Don't write an ADR for:
- Day-to-day task execution
- Reversible implementation choices inside a PR
- Bug fixes (those go in PR descriptions)
