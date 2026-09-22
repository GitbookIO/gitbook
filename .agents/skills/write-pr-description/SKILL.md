---
name: write-pr-description
description: Write a concise, product-focused PR description from the changes and available discussion. Use when asked for a PR summary or description.
---

# Write a PR description

Read the full branch diff and commit history against the PR's base branch, not just the latest commit. Use the PR discussion and linked issues for context when available. The PR's changes are the source of truth for what ships if an issue describes something different.

Write for contributors and reviewers who may not know the area. Lead with what changes, prefer user or product impact when supported, and include implementation details only when they help review. Keep the proposed changes short, using bullets only when useful.

Include relevant validation and screenshots when available. Do not claim checks passed unless they ran. Use only information appropriate for a public repository; do not copy private issue details or customer information into the description.

## Template and changelog

Read `.github/pull_request_template.md` immediately before writing. Preserve its section names and order. Always include `Proposed changes` and `Changelog`; omit `Demo` when there is nothing to show and `Context` when it adds no useful explanation.

Write a short changelog entry describing what shipped. Use `[Feature]` for user-facing additions or improvements, `[Fix]` for user-facing bug fixes, and `[Chore]` for internal maintenance. Remove unused examples and placeholders. Usually one entry is enough; use more only for distinct changes. The PR changelog does not replace any changeset required by `AGENTS.md`.

## Optional context

Add this section only when it helps someone outside the area understand why the change matters. Context explains why the change matters; the changelog says what shipped; proposed changes can explain implementation. Omit context if it repeats those sections, adds generic filler, or requires guessing the reason or impact.

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
