---
name: write-pr-description
description: Write a concise, product-focused PR description from the changes and available discussion. Use when asked for a PR summary or description.
---

# Write a PR description

Read the full branch diff and commit history against the PR's base branch, not just the latest commit. Use the PR discussion and linked issues for context when available. The PR's changes are the source of truth for what ships if an issue describes something different.

Write for contributors and reviewers who may not know the area. Lead with what changes, prefer user or product impact when supported, and include implementation details only when they help review. Keep small PRs to a short paragraph; add bullets or headings only when useful. No template or changelog section is required.

Include relevant validation and screenshots when available. Do not claim checks passed unless they ran. Use only information appropriate for a public repository; do not copy private issue details or customer information into the description.

## Optional context

Add this section only when it helps someone outside the area understand why the change matters. Omit it if it repeats the description, adds generic filler, or requires guessing the reason or impact.

```markdown
## Context

**Problem:** What wasn't working or what was missing?

**Outcome:** What becomes possible or works differently after this PR?
```

Keep each field to 1–2 short, non-technical sentences. Describe the problem and outcome, not the implementation. For infrastructure changes, explain the failure or limitation they caused. Do not invent an actor, customer segment, ownership, or impact, or force the change into a user story.

## Writing pass

- Use plain words and direct verbs: "use" instead of "leverage", "help" instead of "facilitate". Prefer active voice when the actor is known.
- Name the concrete behavior instead of saying "improves the experience" or "makes it more robust". Support performance claims with measurements.
- Cut filler, promotional language, and generic conclusions. If a sentence could fit almost any PR, make it specific or delete it.
- Keep one idea per sentence and use consistent names. Remove redundant hedging without hiding real uncertainty.
- Avoid "not just X, but Y", forced groups of three, em dashes, decorative emojis, and unnecessary bold text.

Return the description in a Markdown code block unless asked to update the PR. When asked to update it, apply the description with `gh pr edit` using a body file.
